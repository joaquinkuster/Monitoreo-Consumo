package main

import (
	"context"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"sort"
	"strconv"
	"time"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/db"
	"github.com/gorilla/websocket"
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

type DashboardData struct {
	Threshold float64
	Eventos   []string
	Resumenes map[string]Resumen
}

var firebaseClient *db.Client

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Permitir todas las conexiones
		return true
	},
}

func main() {
	ctx := context.Background()
	opt := option.WithCredentialsFile("./credentials/monitoreo-consumo-d3933-firebase-adminsdk-fbsvc-991544dd8c.json")
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Error al inicializar Firebase: %v", err)
	}

	firebaseClient, err = app.DatabaseWithURL(ctx, "https://monitoreo-consumo-d3933-default-rtdb.firebaseio.com/")
	if err != nil {
		log.Fatalf("Error al obtener cliente de base de datos: %v", err)
	}

	http.HandleFunc("/", dashboardHandler)
	http.HandleFunc("/ws", wsHandler)

	log.Println("Servidor iniciado en http://localhost:8080")
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}

func dashboardHandler(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.New("template.html").Funcs(template.FuncMap{
		"formatTimestamp": formatTimestamp,
	}).ParseFiles("dashboard/template.html"))

	data := fetchDashboardData()
	err := tmpl.Execute(w, data)
	if err != nil {
		log.Println("Error ejecutando template:", err)
	}
}

func formatTimestamp(t int64) string {
	return time.Unix(t, 0).Format("02 Jan 2006 15:04:05")
}

func fetchDashboardData() DashboardData {
	ctx := context.Background()

	// Obtener resumenes (map[sector]map[timestamp]Resumen)
	var resumenesRaw map[string]map[string]Resumen
	err := firebaseClient.NewRef("resumenes").Get(ctx, &resumenesRaw)
	if err != nil {
		log.Println("Error obteniendo resumenes:", err)
		return DashboardData{}
	}

	// Elegir solo el resumen más reciente por sector
	resumenes := make(map[string]Resumen)
	for sector, m := range resumenesRaw {
		var ultTimestamp int64 = 0
		var ultResumen Resumen
		for tsStr, resumen := range m {
			// Convertir tsStr a int64
			ts, err := strconv.ParseInt(tsStr, 10, 64)
			if err != nil {
				continue
			}
			if ts > ultTimestamp {
				ultTimestamp = ts
				ultResumen = resumen
			}
		}
		if ultTimestamp != 0 {
			resumenes[sector] = ultResumen
		}
	}

	// Obtener eventos (similarly: map[sector]map[timestamp]Evento)
	var eventosRaw map[string]map[string]Evento
	err = firebaseClient.NewRef("eventos").Get(ctx, &eventosRaw)
	if err != nil {
		log.Println("Error obteniendo eventos:", err)
		return DashboardData{
			Threshold: 5.0,
			Resumenes: resumenes,
		}
	}

	// Aplanar y ordenar eventos por timestamp descendente
	var eventosOrdenados []Evento
	for _, m := range eventosRaw {
		for _, ev := range m {
			eventosOrdenados = append(eventosOrdenados, ev)
		}
	}
	sort.Slice(eventosOrdenados, func(i, j int) bool {
		return eventosOrdenados[i].Timestamp > eventosOrdenados[j].Timestamp
	})

	// Formatear eventos para mostrar 10 más recientes
	eventosFmt := []string{}
	for i, e := range eventosOrdenados {
		if i >= 10 {
			break
		}
		t := time.Unix(e.Timestamp, 0).Format("02/01 15:04")
		eventosFmt = append(eventosFmt, fmt.Sprintf("[%s] %s - %s", t, e.Sector, e.Motivo))
	}

	return DashboardData{
		Threshold: 5.0,
		Eventos:   eventosFmt,
		Resumenes: resumenes,
	}
}

// WebSocket handler para enviar datos en tiempo real
func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket error:", err)
		return
	}
	defer conn.Close()

	ctx := context.Background()
	var lastEventTimestamp int64 = 0

	for {
		time.Sleep(3 * time.Second)

		// Obtener resumenes
		var resumenesRaw map[string]map[string]Resumen
		err := firebaseClient.NewRef("resumenes").Get(ctx, &resumenesRaw)
		if err != nil {
			log.Println("Error obteniendo resumenes:", err)
			continue
		}

		// Elegir solo el resumen más reciente por sector
		resumenes := make(map[string]Resumen)
		for sector, m := range resumenesRaw {
			var ultTimestamp int64 = 0
			var ultResumen Resumen
			for tsStr, resumen := range m {
				ts, err := strconv.ParseInt(tsStr, 10, 64)
				if err != nil {
					continue
				}
				if ts > ultTimestamp {
					ultTimestamp = ts
					ultResumen = resumen
				}
			}
			if ultTimestamp != 0 {
				resumenes[sector] = ultResumen
			}
		}

		// Obtener eventos
		var eventosRaw map[string]map[string]Evento
		err = firebaseClient.NewRef("eventos").Get(ctx, &eventosRaw)
		if err != nil {
			log.Println("Error obteniendo eventos:", err)
			continue
		}

		// Aplanar eventos
		var eventos []Evento
		for _, m := range eventosRaw {
			for _, ev := range m {
				if ev.Timestamp > lastEventTimestamp {
					eventos = append(eventos, ev)
					if ev.Timestamp > lastEventTimestamp {
						lastEventTimestamp = ev.Timestamp
					}
				}
			}
		}

		// Enviar datos JSON por WebSocket
		msg := struct {
			Resumenes map[string]Resumen `json:"resumenes"`
			Eventos   []Evento           `json:"eventos"`
		}{
			Resumenes: resumenes,
			Eventos:   eventos,
		}

		err = conn.WriteJSON(msg)
		if err != nil {
			log.Println("Error enviando datos por WS:", err)
			break
		}
	}
}
