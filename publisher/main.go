package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type SensorData struct {
	Sector      string  `json:"sector"`
	Timestamp   int64   `json:"timestamp"`
	Presence    bool    `json:"presence"`
	CurrentA    float64 `json:"current_a"`
	Temperature float64 `json:"temperature"`
}

func randomBool(p float64) bool {
	return rand.Float64() < p
}

func randomFloat(min, max float64) float64 {
	return min + rand.Float64()*(max-min)
}

func simulateAndPublish(client mqtt.Client, sector string) {
	data := SensorData{
		Sector:      sector,
		Timestamp:   time.Now().Unix(),
		Presence:    randomBool(0.7),
		CurrentA:    randomFloat(0.5, 5.0),
		Temperature: randomFloat(20.0, 28.0),
	}

	payload, _ := json.Marshal(data)
	topic := fmt.Sprintf("office/%s/sensors", sector)

	token := client.Publish(topic, 0, false, payload)
	token.Wait()

	fmt.Printf("[PUBLISH] %s -> %s\n", topic, payload)
}

func main() {
	rand.Seed(time.Now().UnixNano())

	opts := mqtt.NewClientOptions().
		AddBroker("tcp://localhost:1883").
		SetClientID("sensor-publisher")

	client := mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	sectors := []string{"A", "B", "C"}
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		for _, s := range sectors {
			simulateAndPublish(client, s)
		}
	}
}