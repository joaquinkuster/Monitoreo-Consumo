package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"sync"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"

	"net/url"

	"github.com/gorilla/websocket"
)

type DatosSensor struct {
	Oficina     string  `json:"oficina"`
	TiempoUnix  int64   `json:"timestamp"`
	Presencia   bool    `json:"presencia"`
	CorrienteA  float64 `json:"corriente_a"`
	Temperatura float64 `json:"temperatura"`
}

type ParametrosConfig struct {
	HoraInicio          float64 `json:"hora_inicio"`
	HoraFin             float64 `json:"hora_fin"`
	UmbralTemperaturaAC float64 `json:"umbral_temperatura_ac"`
	UmbralCorriente     float64 `json:"umbral_corriente"`
	Voltaje             float64 `json:"voltaje"`
	CostoKwh            float64 `json:"costo_kwh"`
}

type Oficina struct {
	Nombre              string            `json:"nombre"`
	Sector              string            `json:"sector"`
	Baja                bool              `json:"baja"`
	EstadosDispositivos map[string]bool   `json:"estados_dispositivos"` // aire, luces, etc.
	Resumenes           map[int64]Resumen `json:"resumenes"`            // Resúmenes de consumo
	Avisos              map[int64]Aviso   `json:"avisos"`               // Eventos reportados
}

// Estructura para guardar un resumen periódico
type Resumen struct {
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

// Estructura para registrar los eventos reportados por los sensores
type Aviso struct {
	Timestamp int64  `json:"timestamp"`
	IdTipo    string `json:"id_tipo"`
	Adicional string `json:"adicional"` // Información adicional del evento
}

type TipoAviso struct {
	Motivo  string `json:"motivo"`
	Detalle string `json:"detalle"`
	Impacto int64  `json:"impacto"` // 1: Exito, 2: Advertencia, 3: Error
}

var params ParametrosConfig
var dispositivos = make(map[string]map[string]bool) // oficina -> dispositivo -> estado
var oficinas = []string{}
var mu sync.RWMutex

// Constantes base para simulación (puedes eliminarlas si config es suficiente)
const (
	temperaturaMinBase      = 22.0
	temperaturaMaxBase      = 26.0
	variacionMaxTemperatura = 0.4
	consumoLuces            = 3.0
	consumoAire             = 10.0
	probabilidadCorte       = 0.005
	duracionMinCorte        = 2 * 60
	duracionMaxCorte        = 5 * 60
)

var (
	ultimaTemperatura = make(map[string]float64)
	cortesEnergia     = make(map[string]int64)
)

// Reemplazo simple para obtener estado dispositivos robusto, asignando valores por defecto si está vacío
func obtenerEstadoDispositivos(oficina string) map[string]bool {
	mu.RLock()
	estado, existe := dispositivos[oficina]
	mu.RUnlock()
	if !existe || estado == nil || len(estado) == 0 {
		// asignar estado por defecto
		estado = map[string]bool{
			"aire":  true,
			"luces": true,
		}
		// Guardarlo para siguiente uso
		mu.Lock()
		dispositivos[oficina] = estado
		mu.Unlock()
	}
	return estado
}

// EsHorarioLaboral retorna true si la hora actual está dentro del horario laboral
func EsHorarioLaboral(t time.Time) bool {
	dia := t.Weekday()
	hora := float64(t.Hour()) + float64(t.Minute())/100.0
	return dia >= time.Monday && dia <= time.Friday &&
		hora >= params.HoraInicio && hora < params.HoraFin
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

// HayCorteDeEnergia retorna true si la oficina está actualmente sin energía
func HayCorteDeEnergia(oficina string, ahora int64) bool {
	fin, enCorte := cortesEnergia[oficina]
	return enCorte && ahora <= fin
}

// PosibleCorteDeEnergia decide aleatoriamente si se produce un corte en una oficina
func PosibleCorteDeEnergia(oficina string, ahora int64) {
	if _, enCorte := cortesEnergia[oficina]; enCorte {
		return // Ya está en corte
	}

	if rand.Float64() < probabilidadCorte {
		duracion := int64(rand.Intn(duracionMaxCorte-duracionMinCorte+1) + duracionMinCorte) // Duración aleatoria del corte
		cortesEnergia[oficina] = ahora + duracion
		fmt.Printf("[CORTE] Oficina %s: Corte de energía hasta %d\n", oficina, cortesEnergia[oficina])
	}
}

// CalcularCorriente ahora usa obtenerEstadoRobusto para usar siempre estado válido
func CalcularCorriente(oficina string, presencia bool, temperatura float64) float64 {
	estado := obtenerEstadoDispositivos(oficina) // mismo estado garantizado

	mu.RLock()
	umbralTemp := params.UmbralTemperaturaAC
	mu.RUnlock()

	base := 0.5 + rand.Float64()*(3.0-0.5)

	if presencia {
		if estado["luces"] {
			base += consumoLuces
		}
		if temperatura >= umbralTemp && estado["aire"] {
			base += consumoAire
		}
		base += 1.0 + rand.Float64()*(7.0-1.0)
	}

	return base
}

// Funcion para actualizar dispositivos al recibir mensaje websocket
func actualizarDispositivos(data []byte) {
	var msg struct {
		Tipo string
		Data map[string]map[string]bool
	}
	err := json.Unmarshal(data, &msg)
	if err != nil || msg.Tipo != "dispositivos" {
		log.Printf("Error parseando dispositivos: %v", err)
		return
	}
	mu.Lock()
	for oficina, estados := range msg.Data {
		dispositivos[oficina] = estados
	}
	mu.Unlock()
	log.Printf("Estados dispositivos actualizados: %+v", msg.Data)
}

// Función para actualizar oficinas (lista dinámica)
func actualizarOficinas(data []byte) {
	var msg struct {
		Tipo string
		Data map[string]interface{}
	}
	err := json.Unmarshal(data, &msg)
	if err != nil || msg.Tipo != "oficinas" {
		log.Printf("Error parseando oficinas: %v", err)
		return
	}
	mu.Lock()
	oficinas = []string{}
	for oficina := range msg.Data {
		oficinas = append(oficinas, oficina)
	}
	mu.Unlock()
	log.Printf("Oficinas actualizadas: %+v", oficinas)
}

// Función para actualizar configuración desde mensaje WS
func actualizarConfiguracion(data []byte) {
	var msg struct {
		Tipo string           `json:"tipo"`
		Data ParametrosConfig `json:"data"`
	}
	err := json.Unmarshal(data, &msg)
	if err != nil {
		log.Printf("Error parseando configuración: %v", err)
		return
	}
	if msg.Tipo != "params" {
		log.Printf("Mensaje ignorado, tipo recibido: %s", msg.Tipo)
		return
	}

	mu.Lock()
	params = msg.Data
	mu.Unlock()

	log.Printf("Configuración actualizada: %+v", params)
}

// Función para simular y publicar, utiliza obtenerEstadoRobusto para estado seguro
func SimularYPublicar(cliente mqtt.Client, oficina string) {
	ahora := time.Now()
	timestamp := ahora.Unix()

	// Ver si hay un nuevo corte
	PosibleCorteDeEnergia(oficina, timestamp)
	sinEnergia := HayCorteDeEnergia(oficina, timestamp)

	// Verificar presencia
	presencia := false
	if !sinEnergia {
		presencia = DetectarPresencia(ahora)
	}

	// Obtener temperatura anterior o inicializarla
	tempAnterior, existe := ultimaTemperatura[oficina]
	if !existe {
		tempAnterior = rand.Float64()*(temperaturaMaxBase-temperaturaMinBase) + temperaturaMinBase
	}
	temperatura := CalcularSiguienteTemperatura(tempAnterior)
	ultimaTemperatura[oficina] = temperatura

	// Calcular corriente solo si no hay corte de energía
	corriente := 0.0
	if presencia {
		corriente = CalcularCorriente(oficina, presencia, temperatura)
	}

	// Construir el mensaje de datos del sensor
	datos := DatosSensor{
		Oficina:     oficina,
		TiempoUnix:  timestamp,
		Presencia:   presencia,
		CorrienteA:  corriente,
		Temperatura: temperatura,
	}

	// Publicar en el tópico MQTT
	payload, _ := json.Marshal(datos)
	topico := fmt.Sprintf("oficinas/%s/sensores", oficina)
	token := cliente.Publish(topico, 0, false, payload)
	token.Wait()
	fmt.Printf("[PUBLICADO] %s -> %s\n", topico, payload)
}

// Función que lanza los listeners websocket para actualizar dispositivos y oficinas dinámicamente
func iniciarListeners() {
	go socketListener("/ws/dispositivos", actualizarDispositivos)
	go socketListener("/ws/oficinas", actualizarOficinas)
	go socketListener("/ws/params", actualizarConfiguracion)
}

// Función genérica para escuchar cualquier WebSocket
func socketListener(endpoint string, updateFunc func(data []byte)) {
	u := url.URL{Scheme: "ws", Host: "localhost:8080", Path: endpoint}
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Printf("Error conectando a %s: %v\n", endpoint, err)
		return
	}
	defer conn.Close()
	log.Printf("Conectado a %s", endpoint)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error leyendo mensaje de %s: %v\n", endpoint, err)
			return
		}
		updateFunc(message)
	}
}

func main() {
	rand.Seed(time.Now().UnixNano())

	// Inicializa cliente MQTT
	opciones := mqtt.NewClientOptions().
		AddBroker("tcp://localhost:1883").
		SetClientID("publicador-sensores")
	clienteMQTT := mqtt.NewClient(opciones)
	if token := clienteMQTT.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	// Arrancar listeners de sockets
	iniciarListeners()

	// Esperar un momento para obtener primera sincronía (o mejor implementa sincronización real)
	time.Sleep(5 * time.Second)

	// Loop de simulación
	temporizador := time.NewTicker(10 * time.Second)
	defer temporizador.Stop()

	for range temporizador.C {
		mu.RLock()
		copyOficinas := make([]string, len(oficinas))
		copy(copyOficinas, oficinas)
		mu.RUnlock()

		for _, oficina := range copyOficinas {
			SimularYPublicar(clienteMQTT, oficina)
		}
	}
}

/*
Este archivo simula sensores que publican datos a través del protocolo MQTT a un broker local, como si fuera un sistema de monitoreo de consumo eléctrico por oficinas en una oficina.

¿Qué hace todo el programa?
Cada 10 segundos:

- Simula datos de sensores para x oficinas.
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
