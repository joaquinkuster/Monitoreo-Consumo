package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"text/template"

	"firebase.google.com/go/db"
	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type DashboardData struct {
	CurrentA      map[string]float64
	Threshold     float64
	LightStatus   map[string]bool
	ACStatus      map[string]bool
	EnergySavings []string
	Events        []string
	History       map[string][]float64
}

var (
	firebaseClient *db.Client
	mqttClient     mqtt.Client
)

func main() {
	// Inicializa Firebase
	//ctx := context.Background()
	// Configura tu archivo de credenciales
	// ...
	// Inicializa MQTT para comandos
	opts := mqtt.NewClientOptions().AddBroker("tcp://localhost:1883").SetClientID("dashboard-panel")
	mqttClient = mqtt.NewClient(opts)
	if token := mqttClient.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	http.HandleFunc("/", dashboardHandler)
	http.HandleFunc("/set-threshold", setThresholdHandler)
	http.HandleFunc("/turn-off", turnOffHandler)
	http.ListenAndServe(":8080", nil)
}

func dashboardHandler(w http.ResponseWriter, r *http.Request) {
	data := fetchDashboardData()
	tmpl := template.Must(template.ParseFiles("dashboard/template.html"))
	tmpl.Execute(w, data)
}

func setThresholdHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		var req struct{ Threshold float64 }
		json.NewDecoder(r.Body).Decode(&req)
		config := Config{ThresholdAmperes: req.Threshold}
		SaveConfig("dashboard/config.json", &config)
		w.WriteHeader(http.StatusOK)
	}
}

func turnOffHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		var req struct {
			Sector string
			Device string
		}
		json.NewDecoder(r.Body).Decode(&req)
		// Publica comando MQTT para apagar el dispositivo
		topic := fmt.Sprintf("office/%s/commands", req.Sector)
		payload := map[string]string{"action": "turn_off", "device": req.Device}
		msg, _ := json.Marshal(payload)
		mqttClient.Publish(topic, 0, false, msg)
		w.WriteHeader(http.StatusOK)
	}
}

func fetchDashboardData() DashboardData {
	// Aquí debes consultar Firebase para obtener los datos reales
	// Ejemplo estático:
	return DashboardData{
		CurrentA:      map[string]float64{"A": 3.5, "B": 2.1, "C": 4.0},
		Threshold:     5.0,
		LightStatus:   map[string]bool{"A": true, "B": false, "C": true},
		ACStatus:      map[string]bool{"A": true, "B": false, "C": false},
		EnergySavings: []string{"Apagar luces en áreas no utilizadas."},
		Events:        []string{"Se prendió el aire en oficina A"},
		History: map[string][]float64{
			"A": {2.0, 2.5, 3.0, 3.5},
			"B": {1.0, 1.5, 2.0, 2.1},
			"C": {3.0, 3.5, 4.0, 4.0},
		},
	}
}
