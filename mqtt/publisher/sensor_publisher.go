package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/db"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"google.golang.org/api/option"
)

// DatosSensor representa la estructura de los datos simulados por un sensor
type DatosSensor struct {
	Sector      string  `json:"sector"`      // Sector de la oficina
	TiempoUnix  int64   `json:"timestamp"`   // Tiempo en formato UNIX
	Presencia   bool    `json:"presencia"`   // Si hay o no personas presentes
	CorrienteA  float64 `json:"corriente_a"` // Corriente eléctrica en amperios
	Temperatura float64 `json:"temperatura"` // Temperatura en grados Celsius
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

// Comando representa un comando enviado desde el dashboard
type Comando struct {
	Sector      string `json:"sector"`
	Timestamp   int64  `json:"timestamp"`
	Dispositivo string `json:"dispositivo"`
	Estado      bool   `json:"estado"`
}

// Constantes que controlan la simulación
const (
	temperaturaMinBase      = 22.0   // Temperatura mínima base
	temperaturaMaxBase      = 26.0   // Temperatura máxima base
	variacionMaxTemperatura = 0.4    // Variación aleatoria por ciclo
	horaInicioPresencia     = 8      // Hora laboral mínima
	horaFinPresencia        = 20     // Hora laboral máxima
	umbralAire              = 25.0   // Umbral de temperatura para encender aire
	consumoLuces            = 3      // Corriente que consumen las luces
	consumoAire             = 10     // Corriente que consume el aire acondicionado
	probabilidadCorte       = 0.005  // Probabilidad de corte de energía
	duracionMinCorte        = 2 * 60 // Mínima duración del corte en segundos
	duracionMaxCorte        = 5 * 60 // Máxima duración del corte en segundos
)

// Variables de estado por sector
var (
	ultimaTemperatura   = make(map[string]float64)         // Guarda la última temperatura simulada por sector
	cortesEnergia       = make(map[string]int64)           // Marca cuándo termina el corte en un sector
	estadosDispositivos = make(map[string]map[string]bool) // sector -> dispositivo -> estado
	clienteFirebase     *db.Client
)

// obtenerEstadosDesdeFirebase obtiene el estado de los dispositivos desde Firebase
func obtenerEstadosDesdeFirebase(sector string) map[string]bool {
	ctx := context.Background()
	var estados map[string]bool

	err := clienteFirebase.NewRef(fmt.Sprintf("dispositivos/%s", sector)).Get(ctx, &estados)
	if err != nil {
		fmt.Printf("Error obteniendo estados de dispositivos para sector %s: %v\n", sector, err)
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
			fmt.Printf("[DISPOSITIVO] Estado actualizado desde Firebase para sector %s: %+v\n", sector, estados)
		}
	}
}

// EsHorarioLaboral retorna true si la hora actual está dentro del horario laboral
func EsHorarioLaboral(t time.Time) bool {
	dia := t.Weekday()
	hora := t.Hour()
	return dia >= time.Monday && dia <= time.Friday &&
		hora >= horaInicioPresencia && hora < horaFinPresencia
}

// DetectarPresencia simula detección de personas en función de la hora
func DetectarPresencia(t time.Time) bool {
	if !EsHorarioLaboral(t) {
		return false
	}
	return rand.Float64() < 0.95 // 95% de probabilidad
}

// CalcularSiguienteTemperatura genera una nueva temperatura con una variación leve
func CalcularSiguienteTemperatura(prev float64) float64 {
	delta := (rand.Float64() * 2 * variacionMaxTemperatura) - variacionMaxTemperatura // Genera un cambio aleatorio entre -0.4 y +0.4 grados

	temp := prev + delta
	if temp < 20.0 {
		temp = 20.0
	} else if temp > 30.0 {
		temp = 30.0
	}
	return temp
}

// CalcularCorriente genera un valor de corriente eléctrica en función de la presencia y temperatura
func CalcularCorriente(sector string, presencia bool, temperatura float64) float64 {
	// Consumo pasivo aleatorio (equipos sin uso activo)
	pasivoMin := 0.5
	pasivoMax := 3.0
	base := pasivoMin + rand.Float64()*(pasivoMax-pasivoMin) // Consumo pasivo entre 0.5 y 3 A

	estado := estadosDispositivos[sector]

	if presencia {

		if estado["luces"] {
			base += consumoLuces
		}

		if temperatura >= umbralAire && estado["aire"] {
			base += consumoAire
		}

		// Consumo activo aleatorio (equipos en uso)
		activoMin := 1.0
		activoMax := 7.0
		base += activoMin + rand.Float64()*(activoMax-activoMin) // Consumo activo entre 1 y 7 A
	}

	return base
}

// HayCorteDeEnergia retorna true si el sector está actualmente sin energía
func HayCorteDeEnergia(sector string, ahora int64) bool {
	fin, enCorte := cortesEnergia[sector]
	return enCorte && ahora <= fin
}

// PosibleCorteDeEnergia decide aleatoriamente si se produce un corte en un sector
func PosibleCorteDeEnergia(sector string, ahora int64) {
	if _, enCorte := cortesEnergia[sector]; enCorte {
		return // Ya está en corte
	}

	if rand.Float64() < probabilidadCorte {
		duracion := int64(rand.Intn(duracionMaxCorte-duracionMinCorte+1) + duracionMinCorte) // Duración aleatoria del corte
		cortesEnergia[sector] = ahora + duracion
		fmt.Printf("[CORTE] Sector %s: Corte de energía hasta %d\n", sector, cortesEnergia[sector])
	}
}

// SimularYPublicar genera datos simulados y los publica por MQTT
func SimularYPublicar(cliente mqtt.Client, sector string) {
	ahora := time.Now()
	timestamp := ahora.Unix()

	// Ver si hay un nuevo corte
	PosibleCorteDeEnergia(sector, timestamp)
	sinEnergia := HayCorteDeEnergia(sector, timestamp)

	// Variables simuladas
	presencia := false
	corriente := 0.0

	if !sinEnergia {
		presencia = DetectarPresencia(ahora)
	}

	tempAnterior, existe := ultimaTemperatura[sector]
	if !existe {
		tempAnterior = rand.Float64()*(temperaturaMaxBase-temperaturaMinBase) + temperaturaMinBase // Inicializa con un valor aleatorio
	}
	temperatura := CalcularSiguienteTemperatura(tempAnterior)
	ultimaTemperatura[sector] = temperatura

	if !sinEnergia {
		corriente = CalcularCorriente(sector, presencia, temperatura)
	}

	// Construye el mensaje
	datos := DatosSensor{
		Sector:      sector,
		TiempoUnix:  timestamp,
		Presencia:   presencia,
		CorrienteA:  corriente,
		Temperatura: temperatura,
	}

	// Publica en el tópico MQTT
	payload, _ := json.Marshal(datos)
	topico := fmt.Sprintf("office/%s/sensors", sector)
	token := cliente.Publish(topico, 0, false, payload)
	token.Wait()

	fmt.Printf("[PUBLICADO] %s -> %s\n", topico, payload)
}

// Función principal
func main() {
	rand.Seed(time.Now().UnixNano()) // Inicializa generador de números aleatorios

	// Inicializa Firebase
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

	// Configura cliente MQTT
	opciones := mqtt.NewClientOptions().
		AddBroker("tcp://localhost:1883").
		SetClientID("publicador-sensores")
	cliente := mqtt.NewClient(opciones)
	if token := cliente.Connect(); token.Wait() && token.Error() != nil {
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

	// Ejecutar simulación cada 10 segundos
	temporizador := time.NewTicker(10 * time.Second)
	defer temporizador.Stop()

	for range temporizador.C {
		for _, s := range sectores {
			SimularYPublicar(cliente, s)
		}
	}
}

/*
Este archivo simula sensores que publican datos a través del protocolo MQTT a un broker local, como si fuera un sistema de monitoreo de consumo eléctrico por sectores en una oficina.

¿Qué hace todo el programa?
Cada 10 segundos:

- Simula datos de sensores para tres sectores.
- Publica los datos vía MQTT a un topic del estilo office/A/sensors.
- Los datos incluyen presencia, corriente y temperatura.
- Filtra la información localmente en el borde (edge).
- Detecta eventos relevantes para enviarlos a Firebase, como:
  - Encendido o apagado de luces.
  - Encendido o apagado del aire acondicionado.
  - Consumo anómalo de corriente (más de 10 A sin presencia).
  - Corte de energía (corriente en 0 por más de N segundos).
  - Sensor fuera de servicio (si no publica datos por un período prolongado).
- Solo los eventos importantes o cambios de estado se guardan en Firebase para evitar congestionar la red y minimizar el uso de recursos.

Esto permite una supervisión eficiente, enviando a la nube solo información útil para el administrador.
*/
