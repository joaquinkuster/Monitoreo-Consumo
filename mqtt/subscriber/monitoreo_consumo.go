package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"sync"
	"time"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/db"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"google.golang.org/api/option"

	"net/url"

	"github.com/gorilla/websocket"
)

type TipoAviso struct {
	Motivo  string `json:"motivo"`
	Detalle string `json:"detalle"`
	Impacto int64  `json:"impacto"` // 1: Éxito, 2: Error, 3: Advertencia
}

type ParametrosConfig struct {
	HoraInicio          float64 `json:"hora_inicio"`
	HoraFin             float64 `json:"hora_fin"`
	UmbralTemperaturaAC float64 `json:"umbral_temperatura_ac"`
	UmbralCorriente     float64 `json:"umbral_corriente"`
	Voltaje             float64 `json:"voltaje"`
	CostoKwh            float64 `json:"costo_kwh"`
}

type DatosSensor struct {
	Oficina     string  `json:"oficina"`
	Timestamp   int64   `json:"timestamp"`
	Presencia   bool    `json:"presencia"`
	CorrienteA  float64 `json:"corriente_a"`
	Temperatura float64 `json:"temperatura"`
}

type Aviso struct {
	Timestamp int64  `json:"timestamp"`
	IDTipo    string `json:"id_tipo"`
	Adicional string `json:"adicional"`
}

type Resumen struct {
	Timestamp       int64   `json:"timestamp"`
	CorrienteA      float64 `json:"corriente_a"`
	ConsumoKvh      float64 `json:"consumo_kvh"`
	ConsumoTotalKvh float64 `json:"consumo_total_kvh"`
	MinTemp         float64 `json:"min_temp"`
	MaxTemp         float64 `json:"max_temp"`
	TiempoPresente  int     `json:"tiempo_presente"`
	MontoEstimado   float64 `json:"monto_estimado"`
	MontoTotal      float64 `json:"monto_total"`
}

type EstadoOficina struct {
	UltimaLectura         int64
	Corrientes            []float64
	Consumos              []float64
	Temperaturas          []float64
	TiempoPresente        int
	UltimoResumen         int64
	UltimaPresencia       bool
	LuzEncendida          bool
	AireEncendido         bool
	SinCorrienteDesde     *int64
	SensorFueraDeServicio bool
	ConsumoElevado        bool
	Mutex                 sync.Mutex
}

// Variables globales protegidas con mutex
var (
	mu                 sync.RWMutex
	config             ParametrosConfig
	idsTiposAvisos     []string
	dispositivoEstados map[string]map[string]bool = make(map[string]map[string]bool)
	oficinas           []string
	mapaEstados        = make(map[string]*EstadoOficina)
	clienteFirebase    *db.Client
)

// Función para escuchar mensajes websocket y actualizar la variable pasada
func wsListener(endpoint string, updateFunc func([]byte)) error {
	u := url.URL{Scheme: "ws", Host: "localhost:8080", Path: endpoint}
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return err
	}
	go func() {
		defer conn.Close()
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				log.Printf("Error leyendo ws %s: %v", endpoint, err)
				return
			}
			updateFunc(msg)
		}
	}()
	return nil
}

func actualizarParamsConfig(data []byte) {
	var m struct {
		Tipo string           `json:"tipo"`
		Data ParametrosConfig `json:"data"`
	}
	if err := json.Unmarshal(data, &m); err != nil {
		log.Println("Error parseando configuración:", err)
		return
	}
	if m.Tipo != "params" {
		return
	}
	mu.Lock()
	config = m.Data
	mu.Unlock()
	log.Println("Configuración actualizada:", config)
}

func actualizarTiposAvisos(data []byte) {
	var m struct {
		Tipo string               `json:"tipo"`
		Data map[string]TipoAviso `json:"data"`
	}
	if err := json.Unmarshal(data, &m); err != nil {
		log.Println("Error parseando tipos de avisos:", err)
		return
	}
	if m.Tipo != "tipos_avisos" {
		return
	}
	mu.Lock()
	idsTiposAvisos = []string{}
	for id := range m.Data {
		idsTiposAvisos = append(idsTiposAvisos, id)
	}
	mu.Unlock()
	log.Printf("Tipos de avisos actualizados: %d tipos", len(idsTiposAvisos))
}

func actualizarDispositivos(data []byte) {
	var m struct {
		Tipo string                     `json:"tipo"`
		Data map[string]map[string]bool `json:"data"`
	}
	if err := json.Unmarshal(data, &m); err != nil {
		log.Println("Error parseando estado dispositivos:", err)
		return
	}
	if m.Tipo != "dispositivos" {
		return
	}
	mu.Lock()
	dispositivoEstados = m.Data
	mu.Unlock()
	log.Println("Estados de dispositivos actualizados")
}

func actualizarOficinas(data []byte) {
	var m struct {
		Tipo string                 `json:"tipo"`
		Data map[string]interface{} `json:"data"` // solo interesa claves
	}
	if err := json.Unmarshal(data, &m); err != nil {
		log.Println("Error parseando oficinas:", err)
		return
	}
	if m.Tipo != "oficinas" {
		return
	}
	mu.Lock()
	oficinas = []string{}
	for id := range m.Data {
		oficinas = append(oficinas, id)
	}
	mu.Unlock()
	log.Printf("Oficinas actualizadas: %v", oficinas)
}

func obtenerEstado(oficina string) *EstadoOficina {
	mu.RLock()
	est, existe := mapaEstados[oficina]
	mu.RUnlock()
	if existe {
		return est
	}
	nuevo := &EstadoOficina{}
	mu.Lock()
	mapaEstados[oficina] = nuevo
	mu.Unlock()
	return nuevo
}

func detectarAvisos(datos DatosSensor, estado *EstadoOficina) []Aviso {
	var avisos []Aviso
	ahora := time.Now().Unix()

	mu.RLock()
	estadoDispositivo := dispositivoEstados[datos.Oficina]
	localConfig := config
	localIdsTipos := idsTiposAvisos
	mu.RUnlock()

	agregarAviso := func(idTipo, adicional string) {
		avisos = append(avisos, Aviso{
			Timestamp: ahora,
			IDTipo:    idTipo,
			Adicional: adicional,
		})
	}

	// Avisos de luces
	if datos.Presencia {
		if !estadoDispositivo["luces"] && estado.LuzEncendida {
			agregarAviso(localIdsTipos[0], "")
			estado.LuzEncendida = false
		} else if estadoDispositivo["luces"] && !estado.LuzEncendida {
			agregarAviso(localIdsTipos[1], "")
			estado.LuzEncendida = true
		}
	} else if !datos.Presencia && estado.LuzEncendida {
		agregarAviso(localIdsTipos[2], "")
		estado.LuzEncendida = false
	}

	// Avisos aire acondicionado
	debePrenderAire := datos.Presencia && datos.Temperatura > localConfig.UmbralTemperaturaAC
	if debePrenderAire {
		if !estadoDispositivo["aire"] && estado.AireEncendido {
			agregarAviso(localIdsTipos[3], "")
			estado.AireEncendido = false
		} else if estadoDispositivo["aire"] && !estado.AireEncendido {
			agregarAviso(localIdsTipos[4], "")
			estado.AireEncendido = true
		}
	} else if !debePrenderAire && estado.AireEncendido {
		agregarAviso(localIdsTipos[5], "")
		estado.AireEncendido = false
	}

	// Consumo anómalo
	if !datos.Presencia && datos.CorrienteA > 10.0 {
		agregarAviso(localIdsTipos[6], fmt.Sprintf("Consumo: %.2f A", datos.CorrienteA))
	}

	// Corte de energía
	if datos.CorrienteA <= 0 {
		if estado.SinCorrienteDesde == nil {
			estado.SinCorrienteDesde = &datos.Timestamp
		} else if datos.Timestamp-*estado.SinCorrienteDesde > 60 {
			agregarAviso(localIdsTipos[7], fmt.Sprintf("Sin corriente desde: %d segundos", datos.Timestamp-*estado.SinCorrienteDesde))
			estado.SinCorrienteDesde = nil
		}
	} else {
		estado.SinCorrienteDesde = nil
	}

	// Sensor fuera de servicio
	tiempoSinRespuesta := ahora - estado.UltimaLectura
	if tiempoSinRespuesta > 60 && !estado.SensorFueraDeServicio {
		agregarAviso(localIdsTipos[8], fmt.Sprintf("Tiempo sin respuesta: %d segundos", tiempoSinRespuesta))
		estado.SensorFueraDeServicio = true
	} else if tiempoSinRespuesta <= 60 && estado.SensorFueraDeServicio {
		estado.SensorFueraDeServicio = false
	}

	// Alerta de corriente
	if datos.CorrienteA > localConfig.UmbralCorriente && !estado.ConsumoElevado {
		agregarAviso(localIdsTipos[9], fmt.Sprintf("Consumo: %.2f A", datos.CorrienteA))
		estado.ConsumoElevado = true
	} else if datos.CorrienteA <= localConfig.UmbralCorriente && estado.ConsumoElevado {
		estado.ConsumoElevado = false
	}

	return avisos
}

// Guardar aviso con push para ID único
func guardarAviso(ctx context.Context, oficina string, aviso Aviso) error {
	ref := clienteFirebase.NewRef(fmt.Sprintf("monitoreo_consumo/oficinas/%s/avisos", oficina))
	newRef, err := ref.Push(ctx, aviso)
	if err != nil {
		return err
	}
	log.Printf("Aviso guardado en: %s", newRef.Path)
	return nil
}

// Generar resumen del estado de la oficina
func generarResumen(ahora int64, estado *EstadoOficina) Resumen {
	mu.RLock()
	localConfig := config
	mu.RUnlock()

	sumaCorrientes := 0.0
	sumaConsumos := 0.0
	minT := 1000.0
	maxT := -1000.0

	for _, amp := range estado.Corrientes {
		sumaCorrientes += amp
	}
	promedioAmp := 0.0
	if len(estado.Corrientes) > 0 {
		promedioAmp = sumaCorrientes / float64(len(estado.Corrientes))
	}

	duracionSegundos := len(estado.Corrientes) * 10
	duracionHoras := float64(duracionSegundos) / 3600.0

	promedioW := promedioAmp * localConfig.Voltaje
	promedioKwh := promedioW * duracionHoras / 1000.0

	estado.Consumos = append(estado.Consumos, promedioKwh)
	for _, cons := range estado.Consumos {
		sumaConsumos += cons
	}

	for _, temp := range estado.Temperaturas {
		if temp < minT {
			minT = temp
		}
		if temp > maxT {
			maxT = temp
		}
	}

	return Resumen{
		Timestamp:       ahora,
		CorrienteA:      math.Round(promedioAmp*100) / 100,
		ConsumoKvh:      math.Round(promedioKwh*100) / 100,
		ConsumoTotalKvh: math.Round(sumaConsumos*100) / 100,
		MinTemp:         math.Round(minT*100) / 100,
		MaxTemp:         math.Round(maxT*100) / 100,
		TiempoPresente:  estado.TiempoPresente,
		MontoEstimado:   math.Round(promedioKwh*localConfig.CostoKwh*100) / 100,
		MontoTotal:      math.Round(sumaConsumos*localConfig.CostoKwh*100) / 100,
	}
}

// Guardar resumen con push para ID único
func guardarResumen(ctx context.Context, oficina string, resumen Resumen) error {
	ref := clienteFirebase.NewRef(fmt.Sprintf("monitoreo_consumo/oficinas/%s/resumenes", oficina))
	newRef, err := ref.Push(ctx, resumen)
	if err != nil {
		return err
	}
	log.Printf("Resumen guardado en: %s", newRef.Path)
	return nil
}

func main() {
	// Inicializa Firebase y MQTT
	ctx := context.Background()
	credenciales := option.WithCredentialsFile("../credentials/monitoreo-consumo-d3933-firebase-adminsdk-fbsvc-991544dd8c.json")
	app, err := firebase.NewApp(ctx, nil, credenciales)
	if err != nil {
		log.Fatalf("Error al inicializar Firebase: %v", err)
	}
	clienteFirebase, err = app.DatabaseWithURL(ctx, "https://monitoreo-consumo-d3933-default-rtdb.firebaseio.com/")
	if err != nil {
		log.Fatalf("Error al obtener cliente de base de datos: %v", err)
	}
	opciones := mqtt.NewClientOptions().AddBroker("tcp://localhost:1883").SetClientID("subscriptor-edge")
	clienteMQTT := mqtt.NewClient(opciones)
	if token := clienteMQTT.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	// Lanzar listeners para actualizar config, tiposAvisos, oficinas y dispositivos vía websocket
	if err := wsListener("/ws/params", actualizarParamsConfig); err != nil {
		log.Fatal("No se pudo conectar ws configuración:", err)
	}
	if err := wsListener("/ws/tipos_avisos", actualizarTiposAvisos); err != nil {
		log.Fatal("No se pudo conectar ws tipos avisos:", err)
	}
	if err := wsListener("/ws/oficinas", actualizarOficinas); err != nil {
		log.Fatal("No se pudo conectar ws oficinas:", err)
	}
	if err := wsListener("/ws/dispositivos", actualizarDispositivos); err != nil {
		log.Fatal("No se pudo conectar ws dispositivos:", err)
	}

	topic := "oficinas/+/sensores"
	clienteMQTT.Subscribe(topic, 0, func(_ mqtt.Client, msg mqtt.Message) {
		var datos DatosSensor
		if err := json.Unmarshal(msg.Payload(), &datos); err != nil {
			log.Printf("Error al parsear mensaje: %v", err)
			return
		}
		ahora := time.Now().Unix()
		estado := obtenerEstado(datos.Oficina)
		estado.Mutex.Lock()
		defer estado.Mutex.Unlock()

		estado.Corrientes = append(estado.Corrientes, datos.CorrienteA)
		estado.Temperaturas = append(estado.Temperaturas, datos.Temperatura)
		if datos.Presencia {
			estado.TiempoPresente += 10
		}
		estado.UltimaLectura = datos.Timestamp

		avisos := detectarAvisos(datos, estado)
		for _, av := range avisos {
			if err := guardarAviso(ctx, datos.Oficina, av); err != nil {
				log.Println("Error guardando aviso:", err)
			} else {
				log.Printf("[AVISO] Oficina:%s Tipo:%s Más:%s\n", datos.Oficina, av.IDTipo, av.Adicional)
			}
		}

		if ahora-estado.UltimoResumen >= 60 {
			resumen := generarResumen(ahora, estado)
			if err := guardarResumen(ctx, datos.Oficina, resumen); err != nil {
				log.Println("Error guardando resumen:", err)
			} else {
				estado.UltimoResumen = ahora
				estado.Corrientes = nil
				estado.Temperaturas = nil
				estado.TiempoPresente = 0
				log.Printf("[RESUMEN] Oficina:%s %+v\n", datos.Oficina, resumen)
			}
		}
	})

	select {}
}

/*
Este archivo representa un sistema edge computing que recibe datos vía MQTT desde sensores y almacena en Firebase solo información relevante.

¿Qué hace todo el programa?

- Escucha los datos enviados por sensores de distintos sectores (vía MQTT).
- Por cada dato recibido:
  - Acumula datos para generar un resumen cada 5 minutos.
  - Detecta avisos importantes como:
    - Luces encendidas/apagadas.
    - Aire acondicionado encendido/apagado.
    - Consumo anómalo (corriente > 10 A sin presencia).
    - Corte de energía (corriente en 0 por más de 1 minuto).
- Los avisos detectados y los resúmenes se envían a Firebase.
- Usa estructuras sincronizadas para manejar múltiples sectores.

Esto permite reducir tráfico innecesario hacia la nube, y conservar solo lo más útil para análisis o alertas.
*/
