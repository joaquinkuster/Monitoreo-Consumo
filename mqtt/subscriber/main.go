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
	Impacto int64  `json:"impacto"`
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

var (
	mu                 sync.RWMutex
	config             ParametrosConfig
	idsTiposAvisos     []string
	dispositivoEstados map[string]map[string]bool = make(map[string]map[string]bool)
	oficinas           []string
	mapaEstados        = make(map[string]*EstadoOficina)
	clienteFirebase    *db.Client
)

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
		return
	}
	if m.Tipo != "params" {
		return
	}
	mu.Lock()
	config = m.Data
	mu.Unlock()
}

func actualizarTiposAvisos(data []byte) {
	var m struct {
		Tipo string               `json:"tipo"`
		Data map[string]TipoAviso `json:"data"`
	}
	if err := json.Unmarshal(data, &m); err != nil {
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
}

func actualizarDispositivos(data []byte) {
	var m struct {
		Tipo string                     `json:"tipo"`
		Data map[string]map[string]bool `json:"data"`
	}
	if err := json.Unmarshal(data, &m); err != nil {
		return
	}
	if m.Tipo != "dispositivos" {
		return
	}
	mu.Lock()
	dispositivoEstados = m.Data
	mu.Unlock()
}

func actualizarOficinas(data []byte) {
	var m struct {
		Tipo string                 `json:"tipo"`
		Data map[string]interface{} `json:"data"`
	}
	if err := json.Unmarshal(data, &m); err != nil {
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

	if len(localIdsTipos) == 0 {
		return avisos
	}

	agregarAviso := func(idTipo, adicional string) {
		avisos = append(avisos, Aviso{
			Timestamp: ahora,
			IDTipo:    idTipo,
			Adicional: adicional,
		})
	}

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

	if !datos.Presencia && datos.CorrienteA > 10.0 {
		agregarAviso(localIdsTipos[6], fmt.Sprintf("Consumo: %.2f A", datos.CorrienteA))
	}

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

	tiempoSinRespuesta := ahora - estado.UltimaLectura
	if tiempoSinRespuesta > 60 && !estado.SensorFueraDeServicio {
		agregarAviso(localIdsTipos[8], fmt.Sprintf("Tiempo sin respuesta: %d segundos", tiempoSinRespuesta))
		estado.SensorFueraDeServicio = true
	} else if tiempoSinRespuesta <= 60 && estado.SensorFueraDeServicio {
		estado.SensorFueraDeServicio = false
	}

	if datos.CorrienteA > localConfig.UmbralCorriente && !estado.ConsumoElevado {
		agregarAviso(localIdsTipos[9], fmt.Sprintf("Consumo: %.2f A", datos.CorrienteA))
		estado.ConsumoElevado = true
	} else if datos.CorrienteA <= localConfig.UmbralCorriente && estado.ConsumoElevado {
		estado.ConsumoElevado = false
	}

	return avisos
}

func guardarAviso(ctx context.Context, oficina string, aviso Aviso) error {
	ref := clienteFirebase.NewRef(fmt.Sprintf("monitoreo_consumo/oficinas/%s/avisos", oficina))
	newRef, err := ref.Push(ctx, aviso)
	if err != nil {
		return err
	}
	log.Printf("Aviso guardado en: %s", newRef.Path)
	return nil
}

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
	ctx := context.Background()
	credenciales := option.WithCredentialsFile("../../credentials/firebase-credentials.json")
	app, err := firebase.NewApp(ctx, nil, credenciales)
	if err != nil {
		log.Fatalf("Error al inicializar Firebase: %v", err)
	}
	clienteFirebase, err = app.DatabaseWithURL(ctx, "https://mqtt-mosquitto-3ae51-default-rtdb.firebaseio.com/")
	if err != nil {
		log.Fatalf("Error al obtener cliente de base de datos: %v", err)
	}

	opciones := mqtt.NewClientOptions().AddBroker("tcp://localhost:1883").SetClientID("subscriptor-edge")
	clienteMQTT := mqtt.NewClient(opciones)
	if token := clienteMQTT.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	wsListener("/ws/params", actualizarParamsConfig)
	wsListener("/ws/tipos_avisos", actualizarTiposAvisos)
	wsListener("/ws/oficinas", actualizarOficinas)
	wsListener("/ws/dispositivos", actualizarDispositivos)

	topic := "oficinas/+/sensores"
	clienteMQTT.Subscribe(topic, 0, func(_ mqtt.Client, msg mqtt.Message) {
		var datos DatosSensor
		if err := json.Unmarshal(msg.Payload(), &datos); err != nil {
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
