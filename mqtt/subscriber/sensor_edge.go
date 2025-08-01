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
)

// Estructura para registrar eventos relevantes
type Evento struct {
	//Sector    string `json:"sector"`
	Timestamp int64  `json:"timestamp"`
	Motivo    string `json:"motivo"`
	Detalle   string `json:"detalle"`
	Tipo      int64  `json:"tipo"` // 1: Éxito, 2: Error, 3: Advertencia
}

var eventos map[string][]Evento

// Estructura para guardar un resumen periódico
type Resumen struct {
	//Sector          string  `json:"sector"`
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

var resumenes map[string][]Resumen

// Datos crudos enviados por los sensores
type DatosSensor struct {
	Sector      string  `json:"sector"`
	Timestamp   int64   `json:"timestamp"`
	Presencia   bool    `json:"presencia"`
	CorrienteA  float64 `json:"corriente_a"`
	Temperatura float64 `json:"temperatura"`
}

// Estado acumulado de cada sector
type EstadoSector struct {
	UltimaLectura         int64      // Marca la última lectura recibida
	Corrientes            []float64  // Lista de corrientes medidas
	Consumos              []float64  // Lista de consumos generados
	Temperaturas          []float64  // Lista de temperaturas medidas
	TiempoPresente        int        // Tiempo total en segundos con presencia
	UltimoResumen         int64      // Marca cuándo se generó el último resumen
	UltimaPresencia       bool       // Último estado de presencia detectado
	LuzEncendida          bool       // Indica si las luces están encendidas
	AireEncendido         bool       // Indica si el aire acondicionado está encendido
	SinCorrienteDesde     *int64     // Marca cuándo comenzó un corte de energía
	SensorFueraDeServicio bool       // Indica si el sensor está fuera de servicio, flag para evitar eventos repetidos
	ConsumoElevado        bool       // Indica si hubo un consumo elevado de corriente
	Mutex                 sync.Mutex // Mutex para sincronizar acceso concurrente
}

var (
	umbralTemperaturaAC float64 = 25.0                             // Umbral de temperatura para encender aire acondicionado
	umbralCorriente     float64 = 21.5                             // Umbral de corriente para alertas
	mapaEstados                 = make(map[string]*EstadoSector)   // Mapa que guarda el estado de cada sector\
	estadosDispositivos         = make(map[string]map[string]bool) // sector -> dispositivo -> estado
	voltaje                     = 220.0                            // Voltaje de la red eléctrica (en Argentina)
	costoKwh                    = 0.25                             // Costo por kWh
	clienteFirebase     *db.Client
)

func main() {
	// Inicializar Firebase
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

	// Inicializar cliente MQTT
	opciones := mqtt.NewClientOptions().AddBroker("tcp://localhost:1883").SetClientID("subscriptor-edge")
	clienteMQTT := mqtt.NewClient(opciones)
	if token := clienteMQTT.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	// Sectores simulados
	sectores := []string{"A", "B", "C"}

	// Inicializa estados de dispositivos
	for _, sector := range sectores {
		estadosDispositivos[sector] = map[string]bool{
			"luces": true,
			"aire":  true,
		}
	}

	go actualizarEstadosPeriodicamente(sectores) // Actualiza estados desde Firebase

	topic := "office/+/sensors"
	clienteMQTT.Subscribe(topic, 0, func(_ mqtt.Client, msg mqtt.Message) {
		var datos DatosSensor
		if err := json.Unmarshal(msg.Payload(), &datos); err != nil {
			log.Printf("Error al parsear mensaje: %v", err)
			return
		}

		ahora := time.Now().Unix()
		estado := obtenerEstado(datos.Sector)
		estado.Mutex.Lock()
		defer estado.Mutex.Unlock()

		// Acumular datos para resumen
		estado.Corrientes = append(estado.Corrientes, datos.CorrienteA)
		estado.Temperaturas = append(estado.Temperaturas, datos.Temperatura)
		if datos.Presencia {
			estado.TiempoPresente += 10
		}
		estado.UltimaLectura = datos.Timestamp

		eventos := detectarEventos(datos, estado)
		for _, ev := range eventos {
			ref := clienteFirebase.NewRef(fmt.Sprintf("/eventos/%s/%d", ev.Sector, ev.Timestamp))
			_ = ref.Set(ctx, ev)
			fmt.Printf("[EVENTO] %v\n", ev)
		}

		// Enviar resumen cada 1 minuto, a modo de ejemplo
		if ahora-estado.UltimoResumen >= 60 {
			resumen := generarResumen(datos.Sector, ahora, estado)
			ref := clienteFirebase.NewRef(fmt.Sprintf("/resumenes/%s/%d", resumen.Sector, resumen.Timestamp))
			_ = ref.Set(ctx, resumen)
			estado.UltimoResumen = ahora
			estado.Corrientes = nil
			estado.Temperaturas = nil
			estado.TiempoPresente = 0
			fmt.Printf("[RESUMEN] %+v\n", resumen)
		}
	})

	select {}
}

// obtenerEstadosDesdeFirebase obtiene el estado de los dispositivos desde Firebase
func obtenerEstadosDesdeFirebase(sector string) map[string]bool {
	ctx := context.Background()
	var estados map[string]bool

	err := clienteFirebase.NewRef(fmt.Sprintf("dispositivos/%s", sector)).Get(ctx, &estados)
	if err != nil || estados == nil {
		//fmt.Printf("Error obteniendo estados de dispositivos para sector %s: %v\n", sector, err)
		return map[string]bool{
			"aire":  true,
			"luces": true,
		}
	}

	return estados
}

// actualizarEstadosPeriodicamente consulta Firebase cada 5 segundos
func actualizarEstadosPeriodicamente(sectores []string) {
	ticker := time.NewTicker(5 * time.Second) // frecuencia de consulta
	defer ticker.Stop()

	for range ticker.C {
		for _, sector := range sectores {
			estados := obtenerEstadosDesdeFirebase(sector)
			estadosDispositivos[sector] = estados
			//fmt.Printf("[DISPOSITIVO] Estado actualizado desde Firebase para sector %s: %+v\n", sector, estados)
		}
	}
}

// Devuelve el estado actual o lo inicializa si es nuevo
func obtenerEstado(sector string) *EstadoSector {
	if est, ok := mapaEstados[sector]; ok {
		return est
	}
	mapaEstados[sector] = &EstadoSector{}
	return mapaEstados[sector]
}

// Genera el resumen cada 5 minutos por sector
func generarResumen(sector string, ahora int64, estado *EstadoSector) Resumen {
	sumaCorrientes := 0.0
	sumaConsumos := 0.0
	minT := 1000.0
	maxT := -1000.0

	// Calcular promedio de corriente y consumo
	for _, amp := range estado.Corrientes {
		sumaCorrientes += amp
	}
	promedioAmp := 0.0
	if len(estado.Corrientes) > 0 {
		promedioAmp = sumaCorrientes / float64(len(estado.Corrientes))
	}
	duracionSegundos := len(estado.Corrientes) * 10
	duracionHoras := float64(duracionSegundos) / 3600.0
	promedioW := promedioAmp * voltaje
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
		Sector:          sector,
		Timestamp:       ahora,
		CorrienteA:      math.Round(promedioAmp*100) / 100,
		ConsumoKvh:      math.Round(promedioKwh*100) / 100,
		ConsumoTotalKvh: math.Round(sumaConsumos*100) / 100,
		MinTemp:         math.Round(minT*100) / 100,
		MaxTemp:         math.Round(maxT*100) / 100,
		TiempoPresente:  estado.TiempoPresente,
		MontoEstimado:   math.Round(promedioKwh*costoKwh*100) / 100,
		MontoTotal:      math.Round(sumaConsumos*costoKwh*100) / 100,
	}
}

// Detecta eventos relevantes a partir de los datos de un sector
func detectarEventos(datos DatosSensor, estado *EstadoSector) []Evento {
	var eventos []Evento
	ahora := time.Now().Unix()

	estadoDispositivo := estadosDispositivos[datos.Sector]

	// Evento: Luces encendidas / apagadas
	if datos.Presencia {
		if !estadoDispositivo["luces"] && estado.LuzEncendida {
			eventos = append(eventos, Evento{datos.Sector, ahora, "Luces apagadas", "Estado de luces desactivado", 2})
			estado.LuzEncendida = false
		} else if estadoDispositivo["luces"] && !estado.LuzEncendida {
			eventos = append(eventos, Evento{datos.Sector, ahora, "Luces encendidas", "Detección de presencia", 1})
			estado.LuzEncendida = true
		}
	} else if !datos.Presencia && estado.LuzEncendida {
		eventos = append(eventos, Evento{datos.Sector, ahora, "Luces apagadas", "Ausencia detectada", 2})
		estado.LuzEncendida = false
	}

	// Evento: Aire acondicionado encendido / apagado
	debePrenderAire := datos.Presencia && datos.Temperatura > umbralTemperaturaAC
	if debePrenderAire {
		if !estadoDispositivo["aire"] && estado.AireEncendido {
			eventos = append(eventos, Evento{datos.Sector, ahora, "Aire apagado", "Estado de aire acondicionado desactivado", 2})
			estado.AireEncendido = false
		} else if estadoDispositivo["aire"] && !estado.AireEncendido {
			eventos = append(eventos, Evento{datos.Sector, ahora, "Aire encendido", "Temperatura elevada con presencia", 1})
			estado.AireEncendido = true
		}
	} else if !debePrenderAire && estado.AireEncendido {
		eventos = append(eventos, Evento{datos.Sector, ahora, "Aire apagado", "Condiciones para aire no cumplidas", 2})
		estado.AireEncendido = false
	}

	// Evento: Consumo anómalo
	if !datos.Presencia && datos.CorrienteA > 10.0 {
		eventos = append(eventos, Evento{datos.Sector, ahora, "Consumo anómalo", "Corriente alta sin presencia", 3})
	}

	// Evento: Corte de energía
	if datos.CorrienteA <= 0.0 {
		if estado.SinCorrienteDesde == nil {
			ts := datos.Timestamp
			estado.SinCorrienteDesde = &ts
		} else if datos.Timestamp-*estado.SinCorrienteDesde > 60 {
			eventos = append(eventos, Evento{datos.Sector, ahora, "Corte de energía", fmt.Sprintf("Corriente en 0 por más de %d segundos", datos.Timestamp-*estado.SinCorrienteDesde), 3})
			estado.SinCorrienteDesde = nil
		}
	} else {
		estado.SinCorrienteDesde = nil
	}

	// Evento: Sensor no responde
	tiempoSinRespuesta := ahora - estado.UltimaLectura
	if tiempoSinRespuesta > 60 && !estado.SensorFueraDeServicio {
		eventos = append(eventos, Evento{
			Sector:    datos.Sector,
			Timestamp: ahora,
			Motivo:    "Sensor no responde",
			Detalle:   fmt.Sprintf("No se recibieron datos en los últimos %d segundos", tiempoSinRespuesta),
			Tipo:      2,
		})
		estado.SensorFueraDeServicio = true
	} else if tiempoSinRespuesta <= 60 && estado.SensorFueraDeServicio {
		// Resetear flag si volvió a responder
		estado.SensorFueraDeServicio = false
	}

	// Evento: Alerta de corriente
	if datos.CorrienteA > umbralCorriente && !estado.ConsumoElevado {
		eventos = append(eventos, Evento{
			Sector:    datos.Sector,
			Timestamp: ahora,
			Motivo:    "Alerta de corriente",
			Detalle:   fmt.Sprintf("Consumo elevado: %.2f A", datos.CorrienteA),
			Tipo:      3,
		})
		estado.ConsumoElevado = true
	} else if datos.CorrienteA <= umbralCorriente && estado.ConsumoElevado {
		// Resetear flag si volvió a valores normales
		estado.ConsumoElevado = false
	}

	return eventos
}

/*
Este archivo representa un sistema edge computing que recibe datos vía MQTT desde sensores y almacena en Firebase solo información relevante.

¿Qué hace todo el programa?

- Escucha los datos enviados por sensores de distintos sectores (vía MQTT).
- Por cada dato recibido:
  - Acumula datos para generar un resumen cada 5 minutos.
  - Detecta eventos importantes como:
    - Luces encendidas/apagadas.
    - Aire acondicionado encendido/apagado.
    - Consumo anómalo (corriente > 10 A sin presencia).
    - Corte de energía (corriente en 0 por más de 1 minuto).
- Los eventos detectados y los resúmenes se envían a Firebase.
- Usa estructuras sincronizadas para manejar múltiples sectores.

Esto permite reducir tráfico innecesario hacia la nube, y conservar solo lo más útil para análisis o alertas.
*/
