// -------- subscriber/main.go --------
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	firebase "firebase.google.com/go"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"google.golang.org/api/option"
)

// SensorData coincide con el publisher
type SensorData struct {
	Sector      string  `json:"sector"`
	Timestamp   int64   `json:"timestamp"`
	Presence    bool    `json:"presence"`
	CurrentA    float64 `json:"current_a"`
	Temperature float64 `json:"temperature"`
}

func main() {
	// Inicializar Firebase
	ctx := context.Background()
	opt := option.WithCredentialsFile("/path/to/serviceAccountKey.json")
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("error initializing firebase: %v", err)
	}
	client, err := app.Database(ctx)
	if err != nil {
		log.Fatalf("error initializing database client: %v", err)
	}

	// Inicializar MQTT
	opts := mqtt.NewClientOptions().AddBroker("tcp://localhost:1883").SetClientID("sensor-subscriber")
	mqttClient := mqtt.NewClient(opts)
	if token := mqttClient.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	// Suscribirse a todos los sensores
	topic := "office/+/sensors"
	mqttClient.Subscribe(topic, 0, func(_ mqtt.Client, msg mqtt.Message) {
		var data SensorData
		if err := json.Unmarshal(msg.Payload(), &data); err != nil {
			log.Printf("error parsing message: %v", err)
			return
		}
		// Escribir en Firebase RTDB bajo /readings/{sector}/{timestamp}
		ref := client.NewRef(fmt.Sprintf("/readings/%s/%d", data.Sector, data.Timestamp))
		if err := ref.Set(ctx, data); err != nil {
			log.Printf("error writing to firebase: %v", err)
		} else {
			fmt.Printf("[STORE] sector=%s time=%d\n", data.Sector, data.Timestamp)
		}
	})

	// Mantener el proceso vivo
	select {}
}

/*
Para visualizar los datos en un tablero de control podrías usar:
- Una aplicación web (React/Angular) que consuma Firebase RTDB en tiempo real.
- Mostrar gráficos por sector y umbrales de alerta.
- Funciones específicas: apagado remoto de aires o luces vía llamadas a otro endpoint MQTT.
*/
