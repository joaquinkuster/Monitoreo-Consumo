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

// Evento representa un evento relevante detectado en un sector
type Evento struct {
	ID        int    `json:"id"`
	Sector    string `json:"sector"`
	Timestamp int64  `json:"timestamp"`
	Motivo    string `json:"motivo"`
	Detalle   string `json:"detalle"`
}

// Resumen representa un resumen de condiciones en un sector
type Resumen struct {
	Sector          string  `json:"sector"`
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

// Configuracion representa la configuración de un sector
type Configuracion struct {
	Sector              string  `json:"sector"`
	Timestamp           int64   `json:"timestamp"`
	UmbralTemperaturaAC float64 `json:"umbral_temperatura_ac"`
	UmbralCorriente     float64 `json:"umbral_corriente"`
	voltaje             float64 `json:"voltaje"`
	costoKwh            float64 `json:"costo_kwh"`
	horaInicioPresencia int     `json:"hora_inicio_presencia"`
	horaFinPresencia    int     `json:"hora_fin_presencia"`
}

// Dispositivo representa un dispositivo controlable en un sector
type Dispositivo struct {
	Sector string `json:"sector"`
	Nombre string `json:"dispositivo"`
	Estado bool   `json:"estado"`
}

// DatosDashboard contiene los datos para renderizar la vista
type DatosDashboard struct {
	Eventos   []Evento
	Resumenes map[string]Resumen
	Estados   map[string]map[string]bool // Estados de los dispositivos por sector
}

var clienteFirebase *db.Client

var actualizador = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	ctx := context.Background()
	credenciales := option.WithCredentialsFile("./credentials/monitoreo-consumo-d3933-firebase-adminsdk-fbsvc-991544dd8c.json")

	app, err := firebase.NewApp(ctx, nil, credenciales)
	if err != nil {
		log.Fatalf("Error al inicializar Firebase: %v", err)
	}

	clienteFirebase, err = app.DatabaseWithURL(ctx, "https://monitoreo-consumo-d3933-default-rtdb.firebaseio.com/")
	if err != nil {
		log.Fatalf("Error al obtener cliente de base de datos: %v", err)
	}

	http.HandleFunc("/", manejarDashboard)
	http.HandleFunc("/ws", manejarWebSocket)
	http.HandleFunc("/control", manejarControlWebSocket)

	log.Println("Servidor iniciado en http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

// obtenerDispositivosDesdeFirebase obtiene el estado de los dispositivos desde Firebase
func obtenerDispositivosDesdeFirebase() map[string]map[string]bool {
	ctx := context.Background()
	var dispositivos map[string]map[string]bool

	err := clienteFirebase.NewRef(fmt.Sprintf("dispositivos")).Get(ctx, &dispositivos)
	if err != nil || dispositivos == nil {
		return map[string]map[string]bool{
			"A": {
				"luces": true,
				"aire":  true,
			},
			"B": {
				"luces": true,
				"aire":  true,
			},
			"C": {
				"luces": true,
				"aire":  true,
			},
		}
	}

	for _, dispositivos := range dispositivos {
		for nombre, _ := range dispositivos {
			_, ok := dispositivos[nombre]
			if !ok {
				dispositivos[nombre] = true // Asigna estado por defecto si no existe
			}
		}
	}

	return dispositivos
}

func manejarDashboard(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.New("template.html").Funcs(template.FuncMap{
		"formatearFecha": formatearFecha,
	}).ParseFiles("dashboard/template.html"))

	datos := obtenerDatosDashboard()
	err := tmpl.Execute(w, datos)
	if err != nil {
		log.Println("Error ejecutando template:", err)
	}
}

func formatearFecha(ts int64) string {
	return time.Unix(ts, 0).Format("02 Jan 2006 15:04:05")
}

func obtenerResumenesRecientes() map[string]Resumen {
	ctx := context.Background()
	var jsonResumenes map[string]map[string]Resumen
	err := clienteFirebase.NewRef("resumenes").Get(ctx, &jsonResumenes)
	if err != nil {
		log.Println("Error obteniendo resumenes:", err)
		return nil
	}

	resultado := make(map[string]Resumen)
	for sector, registros := range jsonResumenes {
		var maxTS int64
		var ultimo Resumen
		for tsStr, r := range registros {
			ts, err := strconv.ParseInt(tsStr, 10, 64)
			if err != nil {
				continue
			}
			if ts > maxTS {
				maxTS = ts
				ultimo = r
			}
		}
		if maxTS > 0 {
			resultado[sector] = ultimo
		}
	}
	return resultado
}

func obtenerEventosRecientes(desde int64) ([]Evento, int64) {
	ctx := context.Background()
	var jsonEventos map[string]map[string]Evento
	var eventos []Evento
	nuevoTS := desde

	err := clienteFirebase.NewRef("eventos").Get(ctx, &jsonEventos)
	if err != nil {
		log.Println("Error obteniendo eventos:", err)
		return nil, desde
	}

	// Filtrar eventos desde el timestamp dado
	for _, grupo := range jsonEventos {
		for _, e := range grupo {
			if e.Timestamp > desde {
				eventos = append(eventos, e)
			}
		}
	}

	// Buscar el timestamp más reciente
	for _, e := range eventos {
		if e.Timestamp > desde {
			nuevoTS = e.Timestamp
		}
	}

	sort.Slice(eventos, func(i, j int) bool {
		return eventos[i].Timestamp > eventos[j].Timestamp
	})

	if len(eventos) > 5 {
		eventos = eventos[:5]
	}

	return eventos, nuevoTS
}

func obtenerDatosDashboard() DatosDashboard {
	eventos, _ := obtenerEventosRecientes(time.Now().Unix() - 300)

	return DatosDashboard{
		Eventos:   eventos,
		Resumenes: obtenerResumenesRecientes(),
		Estados:   obtenerDispositivosDesdeFirebase(),
	}
}

func manejarWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := actualizador.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error WebSocket:", err)
		return
	}
	defer conn.Close()

	ultimoTS := time.Now().Unix()

	for {
		time.Sleep(2 * time.Second)

		resumenes := obtenerResumenesRecientes()
		eventos, nuevoTS := obtenerEventosRecientes(ultimoTS)
		ultimoTS = nuevoTS

		mensaje := struct {
			Resumenes map[string]Resumen `json:"resumenes"`
			Eventos   []Evento           `json:"eventos"`
		}{
			Resumenes: resumenes,
			Eventos:   eventos,
		}

		err = conn.WriteJSON(mensaje)
		if err != nil {
			log.Println("Error enviando datos por WS:", err)
			break
		}
	}
}

func manejarControlWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := actualizador.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error al conectar WS control:", err)
		return
	}
	defer conn.Close()

	for {
		var dispositivo Dispositivo
		if err := conn.ReadJSON(&dispositivo); err != nil {
			log.Println("Error leyendo estado de dispositivo:", err)
			break
		}

		ref := clienteFirebase.NewRef(fmt.Sprintf("dispositivos/%s/%s", dispositivo.Sector, dispositivo.Nombre))
		err := ref.Set(context.Background(), dispositivo.Estado)
		if err != nil {
			log.Printf("Error guardando estado de dispositivo en Firebase: %v\n", err)
		} else {
			log.Printf("[DISPOSITIVO] %+v\n", dispositivo)
		}
	}
}
