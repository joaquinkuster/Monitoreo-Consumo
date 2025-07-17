package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	firebase "firebase.google.com/go"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"google.golang.org/api/option"
)

// Estructura para registrar eventos relevantes
type Evento struct {
	Sector    string `json:"sector"`
	Timestamp int64  `json:"timestamp"`
	Motivo    string `json:"motivo"`
	Detalle   string `json:"detalle"`
}

// Estructura para guardar un resumen periódico
type Resumen struct {
	Sector         string  `json:"sector"`
	Timestamp      int64   `json:"timestamp"`
	PromedioAmp    float64 `json:"promedio_amp"`
	MinTemp        float64 `json:"min_temp"`
	MaxTemp        float64 `json:"max_temp"`
	TiempoPresente int     `json:"tiempo_presente"`
}

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
	Temperaturas          []float64  // Lista de temperaturas medidas
	TiempoPresente        int        // Tiempo total en segundos con presencia
	UltimoResumen         int64      // Marca cuándo se generó el último resumen
	UltimaPresencia       bool       // Último estado de presencia detectado
	LuzEncendida          bool       // Indica si las luces están encendidas
	AireEncendido         bool       // Indica si el aire acondicionado está encendido
	SinCorrienteDesde     *int64     // Marca cuándo comenzó un corte de energía
	SensorFueraDeServicio bool       // Indica si el sensor está fuera de servicio, flag para evitar eventos repetidos
	Mutex                 sync.Mutex // Mutex para sincronizar acceso concurrente
}

var (
	umbralTemperaturaAC float64 = 25.0                           // Umbral de temperatura para encender aire acondicionado
	mapaEstados                 = make(map[string]*EstadoSector) // Mapa que guarda el estado de cada sector
)

func main() {
	ctx := context.Background()
	opt := option.WithCredentialsFile("./credentials/monitoreo-consumo-d3933-firebase-adminsdk-fbsvc-991544dd8c.json")

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Error al inicializar Firebase: %v", err)
	}

	db, err := app.DatabaseWithURL(ctx, "https://monitoreo-consumo-d3933-default-rtdb.firebaseio.com/")
	if err != nil {
		log.Fatalf("Error al obtener cliente de base de datos: %v", err)
	}

	opciones := mqtt.NewClientOptions().AddBroker("tcp://localhost:1883").SetClientID("sensor-edge")
	clienteMQTT := mqtt.NewClient(opciones)
	if token := clienteMQTT.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

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
			ref := db.NewRef(fmt.Sprintf("/eventos/%s/%d", ev.Sector, ev.Timestamp))
			_ = ref.Set(ctx, ev)
			fmt.Printf("[EVENTO] %v\n", ev)
		}

		// Enviar resumen cada 1 minuto, a modo de ejemplo
		if ahora-estado.UltimoResumen >= 60 {
			resumen := generarResumen(datos.Sector, ahora, estado)
			ref := db.NewRef(fmt.Sprintf("/resumenes/%s/%d", resumen.Sector, resumen.Timestamp))
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
	var suma float64
	minT := 1000.0
	maxT := -1000.0

	for _, amp := range estado.Corrientes {
		suma += amp
	}
	for _, temp := range estado.Temperaturas {
		if temp < minT {
			minT = temp
		}
		if temp > maxT {
			maxT = temp
		}
	}

	promedio := 0.0
	if len(estado.Corrientes) > 0 {
		promedio = suma / float64(len(estado.Corrientes))
	}

	return Resumen{
		Sector:         sector,
		Timestamp:      ahora,
		PromedioAmp:    promedio,
		MinTemp:        minT,
		MaxTemp:        maxT,
		TiempoPresente: estado.TiempoPresente,
	}
}

// Detecta eventos relevantes a partir de los datos de un sector
func detectarEventos(datos DatosSensor, estado *EstadoSector) []Evento {
	var eventos []Evento
	ahora := time.Now().Unix()

	// Evento: Luces encendidas / apagadas
	if datos.Presencia && !estado.LuzEncendida {
		eventos = append(eventos, Evento{datos.Sector, ahora, "Luces encendidas", "Detección de presencia"})
		estado.LuzEncendida = true
	} else if !datos.Presencia && estado.LuzEncendida {
		eventos = append(eventos, Evento{datos.Sector, ahora, "Luces apagadas", "Ausencia detectada"})
		estado.LuzEncendida = false
	}

	// Evento: Aire acondicionado encendido / apagado
	debePrenderAire := datos.Presencia && datos.Temperatura > umbralTemperaturaAC
	if debePrenderAire && !estado.AireEncendido {
		eventos = append(eventos, Evento{datos.Sector, ahora, "Aire encendido", "Temperatura elevada con presencia"})
		estado.AireEncendido = true
	} else if !debePrenderAire && estado.AireEncendido {
		eventos = append(eventos, Evento{datos.Sector, ahora, "Aire apagado", "Condiciones para aire no cumplidas"})
		estado.AireEncendido = false
	}

	// Evento: Consumo anómalo
	if !datos.Presencia && datos.CorrienteA > 10.0 {
		eventos = append(eventos, Evento{datos.Sector, ahora, "Consumo anómalo", "Corriente alta sin presencia"})
	}

	// Evento: Corte de energía
	if datos.CorrienteA <= 0.0 {
		if estado.SinCorrienteDesde == nil {
			ts := datos.Timestamp
			estado.SinCorrienteDesde = &ts
		} else if datos.Timestamp-*estado.SinCorrienteDesde > 60 {
			eventos = append(eventos, Evento{datos.Sector, ahora, "Corte de energía", "Corriente en 0 por más de 1 minuto"})
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
		})
		estado.SensorFueraDeServicio = true
	} else if tiempoSinRespuesta <= 60 && estado.SensorFueraDeServicio {
		// Resetear flag si volvió a responder
		estado.SensorFueraDeServicio = false
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
