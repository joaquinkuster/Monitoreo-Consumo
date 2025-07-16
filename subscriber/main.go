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

var (
	alertThreshold  float64 = 3.0  // Se puede leer desde config.json si lo deseas
	acTempThreshold float64 = 24.0 // Temperatura mínima para encender el aire
	lastStates              = make(map[string]FilteredData)
)

func main() {
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

	opts := mqtt.NewClientOptions().AddBroker("tcp://localhost:1883").SetClientID("sensor-edge")
	mqttClient := mqtt.NewClient(opts)
	if token := mqttClient.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	topic := "office/+/sensors"
	mqttClient.Subscribe(topic, 0, func(_ mqtt.Client, msg mqtt.Message) {
		var data SensorData
		if err := json.Unmarshal(msg.Payload(), &data); err != nil {
			log.Printf("error parsing message: %v", err)
			return
		}

		// Filtrado inteligente
		filtered := FilterData(data, alertThreshold)
		filtered.ACStatus = ShouldTurnOnAC(filtered.Presence, data.Temperature, acTempThreshold)

		last, exists := lastStates[data.Sector]
		// Solo guarda si cambia presencia, alerta o estado del aire
		if !exists || last.Presence != filtered.Presence || last.Alert != filtered.Alert || last.ACStatus != filtered.ACStatus {
			lastStates[data.Sector] = filtered
			ref := client.NewRef(fmt.Sprintf("/filtered_readings/%s/%d", filtered.Sector, filtered.Timestamp))
			if err := ref.Set(ctx, filtered); err != nil {
				log.Printf("error writing to firebase: %v", err)
			} else {
				fmt.Printf("[STORE] sector=%s time=%d presence=%v currentA=%.2f alert=%v AC=%v\n", filtered.Sector, filtered.Timestamp, filtered.Presence, filtered.CurrentA, filtered.Alert, filtered.ACStatus)
			}
		}
	})

	select {}
}
