/*
Monitoreo de Consumo Eléctrico en una Oficina
Implementación en Go usando MQTT y Firebase RTDB como base de datos en tiempo real.
Estructura del proyecto:

monitoreo_consumo/
├── publisher/
│   └── main.go       // Simula sensores y publica datos vía MQTT
└── subscriber/
    └── main.go       // Recibe datos MQTT y los almacena en Firebase

*/

package main

import (
	"encoding/json" // Para convertir estructuras a JSON
	"fmt"           // Para imprimir en consola
	"math/rand"     // Para generar números aleatorios
	"time"          // Para manejo de tiempo y temporizadores

	mqtt "github.com/eclipse/paho.mqtt.golang" // Cliente MQTT
)

// SensorData representa una lectura simulada de sensores
type SensorData struct {
	Sector      string  `json:"sector"`      // Sector de la oficina (ej: "A")
	Timestamp   int64   `json:"timestamp"`   // Hora actual en formato Unix
	Presence    bool    `json:"presence"`    // Presencia detectada (true/false)
	CurrentA    float64 `json:"current_a"`   // Corriente eléctrica en amperios
	Temperature float64 `json:"temperature"` // Temperatura en grados Celsius
}

// randomBool genera un booleano aleatorio con probabilidad p de ser true
func randomBool(p float64) bool {
	return rand.Float64() < p
}

// randomFloat genera un número flotante aleatorio entre min y max
func randomFloat(min, max float64) float64 {
	return min + rand.Float64()*(max-min)
}

// simulateAndPublish crea datos de sensores y los publica vía MQTT
func simulateAndPublish(client mqtt.Client, sector string) {
	// Crear una estructura con datos simulados
	data := SensorData{
		Sector:      sector,
		Timestamp:   time.Now().Unix(),
		Presence:    randomBool(0.7),         // 70% probabilidad de presencia
		CurrentA:    randomFloat(0.5, 5.0),   // Corriente entre 0.5 y 5.0 A
		Temperature: randomFloat(20.0, 28.0), // Temperatura entre 20 y 28 °C
	}

	// Convertir los datos a formato JSON
	payload, _ := json.Marshal(data)

	// Construir el topic MQTT según el sector
	topic := fmt.Sprintf("office/%s/sensors", sector)

	// Publicar el mensaje en el broker MQTT
	// QoS 0: entrega sin confirmación. false: no se guarda (no es mensaje retenido).
	token := client.Publish(topic, 0, false, payload)
	token.Wait() // Espera a que se complete el envío

	// Mostrar en consola lo publicado
	fmt.Printf("[PUBLISH] %s -> %s\n", topic, payload)
}

func main() {
	// Inicializar semilla aleatoria basada en el tiempo actual
	rand.Seed(time.Now().UnixNano())

	// Configurar conexión al broker MQTT (localhost en el puerto 1883)
	opts := mqtt.NewClientOptions().
		AddBroker("tcp://localhost:1883").
		SetClientID("sensor-publisher") // ID único del publicador

	// Crear y conectar cliente MQTT
	client := mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error()) // Si falla, detener el programa
	}

	// Definir sectores simulados
	sectors := []string{"A", "B", "C"}

	// Crear un temporizador que se dispare cada 10 segundos
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop() // Asegura liberar recursos al salir

	// Cada vez que el temporizador se activa (cada 10s), publicar datos
	for range ticker.C {
		for _, s := range sectors {
			simulateAndPublish(client, s)
		}
	}
}

/* Este archivo simula sensores que publican datos a través del protocolo MQTT
a un broker local, como si fuera un sistema de monitoreo de consumo eléctrico
por sectores en una oficina.

¿Qué hace todo el programa?
Cada 10 segundos:
	1. Simula datos de sensores para tres sectores.
	2. Publica los datos vía MQTT a un topic del estilo office/A/sensors.
	3. Los datos incluyen presencia, corriente y temperatura.

Si estás corriendo un broker MQTT (por ejemplo, Mosquitto en localhost),
estos datos estarán disponibles para cualquier subscriber que escuche esos topics. */
