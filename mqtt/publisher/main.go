package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"sync"
	"time"

	"net/url"

	mqtt "github.com/eclipse/paho.mqtt.golang"
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

var params ParametrosConfig = ParametrosConfig{
	HoraInicio:          8.0,
	HoraFin:             20.0,
	UmbralTemperaturaAC: 25.0,
	UmbralCorriente:     21.5,
	Voltaje:             220.0,
	CostoKwh:            0.25,
}

var dispositivos = make(map[string]map[string]bool)
var oficinas = []string{"A", "B", "C"}
var mu sync.RWMutex

const (
	temperaturaMinBase      = 22.0
	temperaturaMaxBase      = 26.0
	variacionMaxTemperatura = 0.4
	consumoLuces            = 3.0
	consumoAire             = 10.0
)

var ultimaTemperatura = make(map[string]float64)

func obtenerEstadoDispositivos(oficina string) map[string]bool {
	mu.RLock()
	estado, existe := dispositivos[oficina]
	mu.RUnlock()
	if !existe || estado == nil || len(estado) == 0 {
		estado = map[string]bool{
			"aire":  true,
			"luces": true,
		}
		mu.Lock()
		dispositivos[oficina] = estado
		mu.Unlock()
	}
	return estado
}

func EsHorarioLaboral(t time.Time) bool {
	dia := t.Weekday()
	hora := float64(t.Hour()) + float64(t.Minute())/100.0
	return dia >= time.Monday && dia <= time.Friday &&
		hora >= params.HoraInicio && hora < params.HoraFin
}

func DetectarPresencia(t time.Time) bool {
	if !EsHorarioLaboral(t) {
		return false
	}
	return rand.Float64() < 0.95
}

func CalcularSiguienteTemperatura(prev float64) float64 {
	delta := (rand.Float64() * 2 * variacionMaxTemperatura) - variacionMaxTemperatura
	temp := prev + delta
	if temp < 20.0 {
		temp = 20.0
	} else if temp > 30.0 {
		temp = 30.0
	}
	return temp
}

func CalcularCorriente(oficina string, presencia bool, temperatura float64) float64 {
	estado := obtenerEstadoDispositivos(oficina)
	base := 0.5 + rand.Float64()*(3.0-0.5)

	if presencia {
		if estado["luces"] {
			base += consumoLuces
		}
		if temperatura >= params.UmbralTemperaturaAC && estado["aire"] {
			base += consumoAire
		}
		base += 1.0 + rand.Float64()*(7.0-1.0)
	}

	return base
}

func actualizarDispositivos(data []byte) {
	var msg struct {
		Tipo string
		Data map[string]map[string]bool
	}
	err := json.Unmarshal(data, &msg)
	if err != nil || msg.Tipo != "dispositivos" {
		return
	}
	mu.Lock()
	for oficina, estados := range msg.Data {
		dispositivos[oficina] = estados
	}
	mu.Unlock()
}

func actualizarOficinas(data []byte) {
	var msg struct {
		Tipo string
		Data map[string]interface{}
	}
	err := json.Unmarshal(data, &msg)
	if err != nil || msg.Tipo != "oficinas" {
		return
	}
	mu.Lock()
	oficinas = []string{}
	for oficina := range msg.Data {
		oficinas = append(oficinas, oficina)
	}
	mu.Unlock()
}

func actualizarConfiguracion(data []byte) {
	var msg struct {
		Tipo string           `json:"tipo"`
		Data ParametrosConfig `json:"data"`
	}
	err := json.Unmarshal(data, &msg)
	if err != nil {
		return
	}
	if msg.Tipo != "params" {
		return
	}

	mu.Lock()
	params = msg.Data
	mu.Unlock()
}

func SimularYPublicar(cliente mqtt.Client, oficina string) {
	ahora := time.Now()
	timestamp := ahora.Unix()

	presencia := DetectarPresencia(ahora)

	tempAnterior, existe := ultimaTemperatura[oficina]
	if !existe {
		tempAnterior = rand.Float64()*(temperaturaMaxBase-temperaturaMinBase) + temperaturaMinBase
	}
	temperatura := CalcularSiguienteTemperatura(tempAnterior)
	ultimaTemperatura[oficina] = temperatura

	corriente := 0.0
	if presencia {
		corriente = CalcularCorriente(oficina, presencia, temperatura)
	}

	datos := DatosSensor{
		Oficina:     oficina,
		TiempoUnix:  timestamp,
		Presencia:   presencia,
		CorrienteA:  corriente,
		Temperatura: temperatura,
	}

	payload, _ := json.Marshal(datos)
	topico := fmt.Sprintf("oficinas/%s/sensores", oficina)
	token := cliente.Publish(topico, 0, false, payload)
	token.Wait()
	fmt.Printf("[PUBLICADO] %s -> %s\n", topico, payload)
}

func socketListener(endpoint string, updateFunc func(data []byte)) {
	u := url.URL{Scheme: "ws", Host: "localhost:8080", Path: endpoint}
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Printf("Error conectando a %s: %v\n", endpoint, err)
		return
	}
	defer conn.Close()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error leyendo mensaje de %s: %v\n", endpoint, err)
			return
		}
		updateFunc(message)
	}
}

func iniciarListeners() {
	go socketListener("/ws/dispositivos", actualizarDispositivos)
	go socketListener("/ws/oficinas", actualizarOficinas)
	go socketListener("/ws/params", actualizarConfiguracion)
}

func main() {
	rand.Seed(time.Now().UnixNano())

	opciones := mqtt.NewClientOptions().
		AddBroker("tcp://localhost:1883").
		SetClientID("publicador-sensores")
	clienteMQTT := mqtt.NewClient(opciones)
	if token := clienteMQTT.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	iniciarListeners()
	time.Sleep(2 * time.Second)

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
