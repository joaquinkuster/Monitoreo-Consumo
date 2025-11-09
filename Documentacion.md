# DOCUMENTACIÓN COMPLETA DEL SISTEMA DE MONITOREO ENERGÉTICO INTELIGENTE MULTI-PARADIGMA

## ÍNDICE GENERAL

1. [INTRODUCCIÓN Y CONTEXTO](#1-introducción-y-contexto)
2. [ARQUITECTURA DEL SISTEMA](#2-arquitectura-del-sistema)
3. [COMPONENTES TÉCNICOS](#3-componentes-técnicos)
4. [PARADIGMAS DE PROGRAMACIÓN IMPLEMENTADOS](#4-paradigmas-de-programación-implementados)
5. [INSTALACIÓN Y CONFIGURACIÓN](#5-instalación-y-configuración)
6. [MANUAL DE USUARIO](#6-manual-de-usuario)
7. [API Y PROTOCOLOS](#7-api-y-protocolos)
8. [BASE DE DATOS Y ALMACENAMIENTO](#8-base-de-datos-y-almacenamiento)
9. [SISTEMA DE SIMULACIÓN](#9-sistema-de-simulación)
10. [ANÁLISIS DE DATOS](#10-análisis-de-datos)
11. [SISTEMA DE ALERTAS](#11-sistema-de-alertas)
12. [INTERFAZ DE USUARIO](#12-interfaz-de-usuario)
13. [OPTIMIZACIONES Y MEJORAS](#13-optimizaciones-y-mejoras)
14. [TROUBLESHOOTING](#14-troubleshooting)
15. [REFERENCIAS TÉCNICAS](#15-referencias-técnicas)

---

## 1. INTRODUCCIÓN Y CONTEXTO

### 1.1 Propósito del Sistema
El **Sistema de Monitoreo Energético Inteligente Multi-Paradigma** es una plataforma integral diseñada para monitorizar, analizar y optimizar el consumo energético en edificios de oficinas mediante la aplicación de múltiples paradigmas de programación. El sistema combina tecnologías modernas de IoT, análisis de datos en tiempo real, y algoritmos de inteligencia artificial para proporcionar insights accionables sobre el consumo energético.

### 1.2 Objetivos Principales
- **Monitoreo en Tiempo Real**: Seguimiento continuo del consumo eléctrico, temperatura y presencia en oficinas
- **Optimización Energética**: Detección automática de oportunidades de ahorro energético
- **Análisis Multi-Paradigma**: Aplicación de diferentes enfoques computacionales para el análisis de datos
- **Visualización Avanzada**: Representación intuitiva de datos complejos mediante dashboards interactivos
- **Automatización Inteligente**: Control automático de dispositivos basado en reglas y aprendizaje

### 1.3 Alcance del Proyecto
El sistema abarca desde la captura de datos mediante sensores simulados hasta el análisis avanzado utilizando cuatro paradigmas de programación principales:
- Programación distribuida (MPI)
- Programación paralela (OpenMP)
- Programación funcional (Haskell)
- Programación lógica (Prolog)

### 1.4 Público Objetivo
- **Administradores de Edificios**: Monitoreo general y control de dispositivos
- **Analistas de Energía**: Análisis detallado y generación de reportes
- **Desarrolladores**: Extensión del sistema e implementación de nuevos algoritmos
- **Investigadores**: Experimentación con diferentes paradigmas computacionales

### 1.5 Tecnologías Involucradas
| Categoría | Tecnologías |
|-----------|-------------|
| Frontend | HTML5, CSS3, JavaScript, Chart.js, Three.js |
| Backend | Node.js, Go, WebSockets |
| Base de Datos | Firebase Realtime Database |
| Comunicación | MQTT, WebSockets, HTTP/REST |
| Paradigmas | MPI, OpenMP, Haskell, Prolog |
| Simulación | Sensores virtuales, datos sintéticos |

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Diagrama de Arquitectura General

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CLIENTE WEB   │◄──►│   WEB SOCKETS    │◄──►│  SIMULADOR GO   │
│   (Dashboard)   │    │   (Node.js)      │    │  (Publisher)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  FIREBASE RTDB  │◄──►│   BROKER MQTT    │◄──►│  CONSUMIDOR GO  │
│  (Almacenamiento)│   │   (Mosquitto)    │    │  (Subscriber)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  MÓDULOS ANÁLISIS│   │  SISTEMA ALERTAS │    │  MOTOR REGLAS   │
│  (Paradigmas)    │   │  (Notificaciones)│    │    (Prolog)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 2.2 Capas del Sistema

#### 2.2.1 Capa de Presentación (Frontend)
**Tecnologías**: HTML5, CSS3, JavaScript, Chart.js, Three.js
- **Dashboard Interactivo**: Interfaz web responsive con diseño glassmorphism
- **Visualizaciones 3D**: Gráficos tridimensionales para análisis avanzado
- **Controles en Tiempo Real**: Manipulación directa de dispositivos y configuraciones
- **Sistema de Ayuda Integrado**: Tutoriales interactivos y documentación contextual

#### 2.2.2 Capa de Comunicación (Middleware)
**Tecnologías**: WebSockets, MQTT, HTTP
- **WebSockets Server**: Comunicación bidireccional en tiempo real (Node.js + ws)
- **Broker MQTT**: Mensajería pub/sub para datos de sensores (Mosquitto)
- **API REST**: Endpoints para configuración y reportes históricos

#### 2.2.3 Capa de Procesamiento (Backend)
**Tecnologías**: Go, Node.js, Firebase Admin SDK
- **Publisher Go**: Simulación de sensores y publicación MQTT
- **Subscriber Go**: Consumo de mensajes MQTT y almacenamiento en Firebase
- **Procesamiento de Eventos**: Detección de anomalías y generación de alertas

#### 2.2.4 Capa de Almacenamiento (Persistence)
**Tecnologías**: Firebase Realtime Database
- **Estructura de Datos**: Organización jerárquica por oficinas y timestamp
- **Sincronización en Tiempo Real**: Actualizaciones inmediatas entre clientes
- **Reglas de Seguridad**: Control de acceso y validación de datos

#### 2.2.5 Capa de Análisis (Business Logic)
**Tecnologías**: MPI, OpenMP, Haskell, Prolog
- **MPI**: Procesamiento distribuido para análisis de grandes volúmenes
- **OpenMP**: Paralelización para procesamiento en tiempo real
- **Haskell**: Análisis funcional y transformaciones de datos
- **Prolog**: Motor de reglas para recomendaciones inteligentes

### 2.3 Flujo de Datos

#### 2.3.1 Flujo Principal de Datos
```
Sensores Simulados → MQTT Publisher → Broker MQTT → MQTT Subscriber → 
Firebase RTDB → WebSockets → Dashboard → Usuario
```

#### 2.3.2 Flujo de Control
```
Usuario → Dashboard → WebSockets → Firebase RTDB → 
MQTT Subscriber → Dispositivos/Configuración
```

#### 2.3.3 Flujo de Análisis
```
Datos Históricos → Módulos Paradigma → Resultados Análisis → 
Recomendaciones → Dashboard/Alertas
```

### 2.4 Patrones de Diseño Implementados

#### 2.4.1 Publisher-Subscriber (Pub/Sub)
**Aplicación**: Comunicación MQTT entre componentes
```go
// Publisher publica datos de sensores
client.Publish("oficinas/A/sensores", 0, false, payload)

// Subscriber se suscribe a topics
client.Subscribe("oficinas/+/sensores", 0, callback)
```

#### 2.4.2 Observer Pattern
**Aplicación**: Actualizaciones en tiempo real del dashboard
```javascript
// WebSockets notifican cambios
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    this.handleWebSocketMessage(endpoint, data);
};
```

#### 2.4.3 Strategy Pattern
**Aplicación**: Selección de algoritmos por paradigma
```javascript
// Diferentes estrategias de análisis
runMPISimulation(), runOpenMPSimulation(), runHaskellAnalysis()
```

#### 2.4.4 Factory Pattern
**Aplicación**: Creación de componentes de visualización
```javascript
// Factory de gráficos
initializeCharts() {
    this.initializeMainChart();
    this.initializeOfficeChart();
    this.initializeTempChart();
}
```

### 2.5 Consideraciones de Escalabilidad

#### 2.5.1 Escalabilidad Horizontal
- **WebSockets**: Múltiples instancias con balanceo de carga
- **MQTT**: Cluster de brokers para alta disponibilidad
- **Firebase**: Escalado automático por Google

#### 2.5.2 Escalabilidad Vertical
- **Procesamiento MPI**: Adición de nodos de cómputo
- **OpenMP**: Aumento de hilos por servidor
- **Almacenamiento**: Upgrade de planes de Firebase

#### 2.5.3 Estrategias de Caching
- **Frontend**: Cache de recursos estáticos y datos frecuentes
- **Backend**: Cache de consultas frecuentes a Firebase
- **MQTT**: Retención de mensajes para nuevos suscriptores

---

## 3. COMPONENTES TÉCNICOS

### 3.1 Frontend (Dashboard)

#### 3.1.1 Estructura de Archivos
```
resources/
├── template.html              # Página principal
├── assets/
│   ├── dashboard-enhanced.js  # Lógica principal del dashboard
│   ├── styles-modern.css      # Estilos y temas
│   ├── theme-toggle.js        # Control de temas claro/oscuro
│   └── analytics-styles.css   # Estilos específicos para análisis
```

#### 3.1.2 Características del Dashboard

**Diseño Visual**
- **Glassmorphism**: Efectos de vidrio esmerilado con transparencias
- **Temas Dinámicos**: Intercambio entre modo claro y oscuro
- **Responsive Design**: Adaptación a diferentes tamaños de pantalla
- **Animaciones CSS**: Transiciones suaves y efectos hover

**Componentes Principales**
```javascript
class DashboardEnhanced {
    constructor() {
        this.resumenes = {};        // Datos de resumen por oficina
        this.dispositivos = {};     // Estados de dispositivos
        this.eventos = [];          // Historial de eventos y alertas
        this.sockets = {};          // Conexiones WebSocket
        this.charts = {};           // Instancias de gráficos
        this.WS_BASE_URL = 'ws://localhost:8081';
        this.uptimeStart = Date.now();
    }
}
```

#### 3.1.3 Sistema de Gráficos

**Chart.js Configuración**
```javascript
initializeMainChart() {
    this.charts.main = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Timestamps
            datasets: [{
                label: 'Consumo Total (kWh)',
                data: [], // Valores de consumo
                borderColor: 'rgb(67, 97, 238)',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            // ... opciones adicionales
        }
    });
}
```

**Tipos de Gráficos Implementados**
1. **Línea Temporal**: Consumo en tiempo real
2. **Doughnut 3D**: Distribución por oficina
3. **Barras Agrupadas**: Temperaturas mínimas/máximas
4. **Gráfico Radar**: Comparación multi-paradigma

### 3.2 Backend Services

#### 3.2.1 Servidor WebSocket (Node.js)

**Estructura del Servidor**
```javascript
// socket.js - Servidor WebSocket principal
const wssResumenes = new WebSocket.Server({ noServer: true });
const wssAvisos = new WebSocket.Server({ noServer: true });
const wssDispositivos = new WebSocket.Server({ noServer: true });
const wssParams = new WebSocket.Server({ noServer: true });

// Manejo de conexiones por endpoint
wssResumenes.on('connection', (ws) => {
    console.log('🔌 Cliente conectado a RESUMENES');
    // Envío de datos iniciales y actualizaciones periódicas
});
```

**Endpoints WebSocket Disponibles**
- `/ws/resumenes`: Datos de consumo y métricas
- `/ws/avisos`: Notificaciones y alertas del sistema
- `/ws/dispositivos`: Estados y control de dispositivos
- `/ws/params`: Configuración del sistema

#### 3.2.2 Simulador de Sensores (Go - Publisher)

**Estructura de Datos**
```go
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
```

**Algoritmo de Simulación**
```go
func SimularYPublicar(cliente mqtt.Client, oficina string) {
    ahora := time.Now()
    timestamp := ahora.Unix()
    presencia := DetectarPresencia(ahora)
    
    // Cálculo de temperatura con variación realista
    tempAnterior, existe := ultimaTemperatura[oficina]
    if !existe {
        tempAnterior = rand.Float64()*(temperaturaMaxBase-temperaturaMinBase) + temperaturaMinBase
    }
    temperatura := CalcularSiguienteTemperatura(tempAnterior)
    ultimaTemperatura[oficina] = temperatura
    
    // Cálculo de corriente basado en presencia y dispositivos
    corriente := 0.0
    if presencia {
        corriente = CalcularCorriente(oficina, presencia, temperatura)
    }
    
    // Publicación MQTT
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
}
```

#### 3.2.3 Procesador de Datos (Go - Subscriber)

**Estructura de Procesamiento**
```go
func main() {
    // Conexión a Firebase
    ctx := context.Background()
    credenciales := option.WithCredentialsFile("../../credentials/firebase-credentials.json")
    app, err := firebase.NewApp(ctx, nil, credenciales)
    
    // Conexión MQTT
    opciones := mqtt.NewClientOptions().AddBroker("tcp://localhost:1883").SetClientID("subscriptor-edge")
    clienteMQTT := mqtt.NewClient(opciones)
    
    // Suscripción a topics
    topic := "oficinas/+/sensores"
    clienteMQTT.Subscribe(topic, 0, func(_ mqtt.Client, msg mqtt.Message) {
        var datos DatosSensor
        if err := json.Unmarshal(msg.Payload(), &datos); err != nil {
            return
        }
        
        // Procesamiento y detección de avisos
        estado := obtenerEstado(datos.Oficina)
        avisos := detectarAvisos(datos, estado)
        
        // Almacenamiento en Firebase
        for _, aviso := range avisos {
            guardarAviso(ctx, datos.Oficina, aviso)
        }
        
        // Generación de resúmenes periódicos
        if ahora-estado.UltimoResumen >= 60 {
            resumen := generarResumen(ahora, estado)
            guardarResumen(ctx, datos.Oficina, resumen)
        }
    })
}
```

### 3.3 Sistema de Comunicación

#### 3.3.1 Protocolo MQTT

**Topics Configurados**
```
oficinas/+/sensores          # Datos de sensores (oficina específica)
oficinas/+/dispositivos      # Control de dispositivos
sistema/configuracion        # Configuración global
sistema/alertas              # Alertas del sistema
```

**Calidad de Servicio (QoS)**
- **QoS 0**: Máximo rendimiento, posible pérdida de mensajes
- **QoS 1**: Entrega garantizada, posibles duplicados
- **QoS 2**: Entrega exactamente una vez, mayor overhead

#### 3.3.2 WebSockets

**Mensajes WebSocket**
```javascript
// Estructura de mensajes
{
    tipo: 'resumenes|avisos|dispositivos|params',
    data: {} // Datos específicos del tipo
}

// Ejemplo mensaje resumenes
{
    tipo: 'resumenes',
    data: {
        "A": {
            timestamp: 1640995200,
            corriente_a: 5.2,
            consumo_kvh: 1.14,
            // ... más campos
        }
    }
}
```

**Manejo de Reconexión**
```javascript
connectToWebSocket(endpoint) {
    const socket = new WebSocket(`${this.WS_BASE_URL}/ws/${endpoint}`);
    
    socket.onopen = () => {
        console.log(`✅ Conectado a ${endpoint}`);
        this.showToast(`Conectado a ${endpoint}`, 'success');
    };
    
    socket.onerror = (error) => {
        console.error(`❌ Error en ${endpoint}:`, error);
        this.showToast(`Error en conexión ${endpoint}`, 'error');
    };
    
    socket.onclose = () => {
        console.log(`🔌 Conexión ${endpoint} cerrada, reconectando...`);
        setTimeout(() => this.connectToWebSocket(endpoint), 3000);
    };
}
```

---

## 4. PARADIGMAS DE PROGRAMACIÓN IMPLEMENTADOS

### 4.1 MPI (Message Passing Interface)

#### 4.1.1 Conceptos Fundamentales

**¿Qué es MPI?**
MPI es un estándar para programación de memoria distribuida que permite la comunicación entre procesos en diferentes nodos de cómputo.

**Ventajas en el Sistema**
- **Escalabilidad Horizontal**: Capacidad de agregar más nodos
- **Tolerancia a Fallos**: Continuidad ante fallos de nodos individuales
- **Procesamiento Masivo**: Ideal para análisis de grandes volúmenes históricos

#### 4.1.2 Implementación en el Sistema

**Simulación de Procesamiento Distribuido**
```javascript
runMPISimulation() {
    const nodes = parseInt(document.getElementById('mpiNodes').value);
    const datasetSize = parseInt(document.getElementById('mpiDatasetSize').value);
    const algorithm = document.getElementById('mpiAlgorithm').value;

    // Visualización de balanceo de carga
    const chunkSizes = this.calculateLoadBalancing(nodes, datasetSize);
    this.simulateMPILoadBalancing(nodes, datasetSize, algorithm);
}
```

**Algoritmos MPI Implementados**

1. **Broadcast**
```javascript
// Un nodo maestro distribuye datos a todos los workers
simulateMPIBroadcast(nodes, dataSize) {
    const masterNode = this.createMPINode(0, 'Master', dataSize);
    const workerNodes = Array.from({length: nodes-1}, (_, i) => 
        this.createMPINode(i+1, 'Worker', 0)
    );
    
    // Simulación de comunicación
    this.animateDataTransfer(masterNode, workerNodes, 'broadcast');
}
```

2. **Scatter/Gather**
```javascript
// División de datos y reunión de resultados
simulateMPIScatterGather(nodes, datasetSize) {
    const chunkSizes = this.calculateLoadBalancing(nodes, datasetSize);
    const masterNode = this.createMPINode(0, 'Master', datasetSize);
    const workerNodes = chunkSizes.map((size, i) => 
        this.createMPINode(i+1, 'Worker', size)
    );
    
    // Fase scatter: distribución
    this.animateDataTransfer(masterNode, workerNodes, 'scatter');
    
    // Procesamiento en workers
    workerNodes.forEach(worker => this.processMPIChunk(worker));
    
    // Fase gather: reunión
    this.animateDataTransfer(workerNodes, masterNode, 'gather');
}
```

3. **Reduce**
```javascript
// Operaciones de reducción (suma, máximo, etc.)
simulateMPIReduce(nodes, datasetSize, operation) {
    const localResults = Array.from({length: nodes}, () => 
        this.generateLocalResult(datasetSize/nodes, operation)
    );
    
    // Aplicación de operación de reducción
    const finalResult = this.applyReduceOperation(localResults, operation);
    
    return {
        localResults,
        finalResult,
        speedup: this.calculateSpeedup(nodes, datasetSize)
    };
}
```

#### 4.1.3 Métricas de Rendimiento MPI

**Cálculo de Speedup**
```javascript
calculateSpeedup(nodes, datasetSize) {
    const sequentialTime = datasetSize * 0.1; // Tiempo secuencial estimado
    const parallelTime = (datasetSize / nodes) * 0.1 + (nodes * 0.05); // + overhead
    return sequentialTime / parallelTime;
}
```

**Eficiencia del Sistema**
```javascript
calculateEfficiency(nodes, speedup) {
    return (speedup / nodes) * 100;
}
```

### 4.2 OpenMP (Open Multi-Processing)

#### 4.2.1 Conceptos Fundamentales

**¿Qué es OpenMP?**
OpenMP es una API para programación paralela de memoria compartida utilizando directivas del compilador.

**Ventajas en el Sistema**
- **Simplicidad**: Directivas fáciles de implementar
- **Flexibilidad**: Diferentes estrategias de planificación
- **Eficiencia**: Bajo overhead para problemas embeblamente paralelos

#### 4.2.2 Implementación en el Sistema

**Estrategias de Scheduling**

1. **Static Scheduling**
```javascript
simulateStaticScheduling(threads, chunkSize, dataSize) {
    const chunks = Math.ceil(dataSize / chunkSize);
    const chunksPerThread = Math.ceil(chunks / threads);
    
    return {
        strategy: 'static',
        chunksPerThread,
        loadBalance: this.calculateLoadBalance(threads, chunksPerThread),
        performance: this.estimatePerformance('static', threads, dataSize)
    };
}
```

2. **Dynamic Scheduling**
```javascript
simulateDynamicScheduling(threads, chunkSize, dataSize) {
    const workQueue = Array.from({length: Math.ceil(dataSize / chunkSize)}, (_, i) => i);
    const threadWork = Array(threads).fill().map(() => []);
    
    // Simulación de asignación dinámica
    while (workQueue.length > 0) {
        const availableThread = this.findAvailableThread(threadWork);
        if (availableThread !== -1) {
            threadWork[availableThread].push(workQueue.shift());
        }
    }
    
    return {
        strategy: 'dynamic',
        workDistribution: threadWork.map(work => work.length),
        loadBalance: this.calculateDynamicLoadBalance(threadWork)
    };
}
```

3. **Guided Scheduling**
```javascript
simulateGuidedScheduling(threads, dataSize) {
    let remaining = dataSize;
    const chunks = [];
    
    while (remaining > 0) {
        const chunkSize = Math.ceil(remaining / threads);
        chunks.push(chunkSize);
        remaining -= chunkSize;
    }
    
    return {
        strategy: 'guided',
        chunks,
        chunkSizes: chunks.map(size => size),
        decreasingPattern: this.analyzeDecreasingPattern(chunks)
    };
}
```

#### 4.2.3 Regiones Paralelas

**Parallel For**
```javascript
simulateParallelFor(threads, arraySize, operation) {
    const results = [];
    const chunkSize = Math.ceil(arraySize / threads);
    
    for (let t = 0; t < threads; t++) {
        const start = t * chunkSize;
        const end = Math.min(start + chunkSize, arraySize);
        results.push(this.processChunk(start, end, operation));
    }
    
    return {
        totalProcessed: arraySize,
        threadsUsed: threads,
        efficiency: this.calculateParallelEfficiency(threads, arraySize)
    };
}
```

**Parallel Sections**
```javascript
simulateParallelSections(threads, sections) {
    const sectionResults = [];
    const availableThreads = Math.min(threads, sections.length);
    
    // Asignación de secciones a threads
    sections.forEach((section, index) => {
        const assignedThread = index % availableThreads;
        sectionResults.push({
            section: section.name,
            thread: assignedThread,
            result: this.processSection(section, assignedThread)
        });
    });
    
    return {
        sectionsProcessed: sections.length,
        threadsUtilized: availableThreads,
        results: sectionResults
    };
}
```

### 4.3 Haskell (Programación Funcional)

#### 4.3.1 Conceptos Fundamentales

**Paradigma Funcional Puro**
- **Inmutabilidad**: Los datos no se modifican, se transforman
- **Transparencia Referencial**: Mismas entradas → mismas salidas
- **Funciones de Primera Clase**: Las funciones pueden ser argumentos y resultados

**Ventajas en el Sistema**
- **Confiabilidad**: Código más predecible y testeable
- **Modularidad**: Composición de funciones pequeñas y reutilizables
- **Expresividad**: Código más conciso y declarativo

#### 4.3.2 Transformaciones Funcionales Implementadas

**Map - Transformación Elemento a Elemento**
```javascript
haskellMap(transformFn, dataArray) {
    return dataArray.map(transformFn);
}

// Ejemplo: Transformación de temperaturas
const celsiusToFahrenheit = temp => (temp * 9/5) + 32;
const tempsF = this.haskellMap(celsiusToFahrenheit, temperatureData);
```

**Filter - Filtrado por Predicado**
```javascript
haskellFilter(predicateFn, dataArray) {
    return dataArray.filter(predicateFn);
}

// Ejemplo: Filtrar consumos anómalos
const highConsumption = consumption => consumption > 2.0;
const anomalies = this.haskellFilter(highConsumption, consumptionData);
```

**Fold - Agregación de Datos**
```javascript
haskellFold(reduceFn, initialValue, dataArray) {
    return dataArray.reduce(reduceFn, initialValue);
}

// Ejemplo: Cálculo de consumo total
const sumConsumption = (total, current) => total + current.consumo_kvh;
const totalConsumption = this.haskellFold(sumConsumption, 0, officeData);
```

**Scan - Acumulación Parcial**
```javascript
haskellScan(reduceFn, initialValue, dataArray) {
    const result = [initialValue];
    dataArray.forEach(item => {
        result.push(reduceFn(result[result.length-1], item));
    });
    return result;
}

// Ejemplo: Acumulación de consumo diario
const dailyAccumulation = this.haskellScan(sumConsumption, 0, hourlyData);
```

#### 4.3.3 Composición de Funciones

**Pipeline Funcional**
```javascript
createFunctionalPipeline(...functions) {
    return (initialData) => {
        return functions.reduce((data, fn) => fn(data), initialData);
    };
}

// Ejemplo: Pipeline de análisis energético
const energyAnalysisPipeline = this.createFunctionalPipeline(
    data => this.haskellFilter(cons => cons > 0, data),        // Filtrar ceros
    data => this.haskellMap(cons => cons * 0.25, data),        // Calcular costo
    data => this.haskellFold((sum, cost) => sum + cost, 0, data) // Sumar total
);

const totalCost = energyAnalysisPipeline(consumptionData);
```

**Funciones de Orden Superior**
```javascript
// Función que crea transformadores específicos
createTemperatureTransformer(targetTemp, tolerance) {
    return (sensorData) => {
        return sensorData.map(reading => ({
            ...reading,
            needsCooling: reading.temperatura > targetTemp + tolerance,
            needsHeating: reading.temperatura < targetTemp - tolerance
        }));
    };
}

const officeTempAnalyzer = this.createTemperatureTransformer(23, 2);
const analysisResults = officeTempAnalyzer(temperatureReadings);
```

### 4.4 Prolog (Programación Lógica)

#### 4.4.1 Conceptos Fundamentales

**Paradigma Lógico Basado en Reglas**
- **Hechos**: Conocimiento base del sistema
- **Reglas**: Relaciones lógicas entre hechos
- **Consultas**: Preguntas al sistema de conocimiento

**Ventajas en el Sistema**
- **Sistema Experto**: Toma de decisiones basada en reglas
- **Flexibilidad**: Fácil modificación y extensión de reglas
- **Explicabilidad**: Trazabilidad de decisiones

#### 4.4.2 Base de Conocimiento Prolog

**Estructura de Reglas**
```javascript
getPrologRules(knowledgeBase) {
    const rules = {
        efficiency: [
            {
                head: 'alta_eficiencia(Oficina)',
                body: 'consumo_kvh < 1.5, tiempo_presente > 30'
            },
            {
                head: 'baja_eficiencia(Oficina)',
                body: 'consumo_kvh > 2.0, tiempo_presente < 20'
            },
            {
                head: 'optimizable(Oficina)',
                body: 'baja_eficiencia(Oficina), not presencia_continua'
            }
        ],
        optimization: [
            {
                head: 'apagar_luces(Oficina)',
                body: 'not presencia, luces_encendidas'
            },
            {
                head: 'ajustar_temperatura(Oficina)',
                body: 'temperatura > 26, aire_encendido'
            }
        ]
    };
    
    return rules[knowledgeBase] || rules.efficiency;
}
```

#### 4.4.3 Motor de Inferencia

**Algoritmo de Unificación**
```javascript
unifyPattern(pattern, data) {
    const variables = this.extractVariables(pattern);
    const bindings = {};
    
    variables.forEach(variable => {
        const value = this.extractValue(variable, data);
        if (value !== null) {
            bindings[variable] = value;
        }
    });
    
    return Object.keys(bindings).length > 0 ? bindings : null;
}
```

**Sistema de Recomendaciones**
```javascript
generatePrologRecommendations(officeData, inferenceLevel) {
    const recommendations = [];
    const rules = this.getPrologRules('optimization');
    
    rules.forEach(rule => {
        const bindings = this.unifyPattern(rule.body, officeData);
        if (bindings) {
            recommendations.push({
                rule: rule.head,
                bindings,
                confidence: this.calculateConfidence(rule, bindings),
                action: this.generateAction(rule.head, bindings)
            });
        }
    });
    
    return recommendations.slice(0, inferenceLevel * 3);
}
```

#### 4.4.4 Estrategias de Búsqueda

**Depth-First Search**
```javascript
prologDFS(goals, knowledgeBase, depth = 0, maxDepth = 10) {
    if (depth > maxDepth) return null;
    
    for (let goal of goals) {
        const matchingRules = this.findMatchingRules(goal, knowledgeBase);
        
        for (let rule of matchingRules) {
            const subgoals = this.extractSubgoals(rule.body);
            const result = this.prologDFS(subgoals, knowledgeBase, depth + 1, maxDepth);
            
            if (result) {
                return {
                    goal,
                    rule: rule.head,
                    subproofs: result
                };
            }
        }
    }
    
    return null;
}
```

**Heuristic Search**
```javascript
prologHeuristicSearch(goals, knowledgeBase, heuristicFn) {
    const agenda = goals.map(goal => ({ goal, priority: heuristicFn(goal) }));
    agenda.sort((a, b) => b.priority - a.priority);
    
    while (agenda.length > 0) {
        const current = agenda.shift();
        const proof = this.attemptProof(current.goal, knowledgeBase);
        
        if (proof) {
            return proof;
        }
        
        // Expandir y agregar nuevos goals con prioridades
        const newGoals = this.expandGoals(current.goal, knowledgeBase);
        newGoals.forEach(goal => {
            agenda.push({
                goal,
                priority: heuristicFn(goal)
            });
        });
        
        agenda.sort((a, b) => b.priority - a.priority);
    }
    
    return null;
}
```

---

## 5. INSTALACIÓN Y CONFIGURACIÓN

### 5.1 Requisitos del Sistema

#### 5.1.1 Requisitos Mínimos
| Componente | Especificación Mínima | Recomendado |
|------------|----------------------|-------------|
| Procesador | Dual-core 2.0 GHz | Quad-core 3.0 GHz+ |
| RAM | 4 GB | 8 GB+ |
| Almacenamiento | 1 GB libre | 5 GB+ SSD |
| Node.js | v14.0+ | v16.0+ LTS |
| Go | v1.16+ | v1.19+ |
| Navegador | Chrome 90+, Firefox 85+ | Chrome 100+ |

#### 5.1.2 Dependencias de Software

**Backend Dependencies**
```json
{
  "dependencies": {
    "firebase": "^9.23.0",
    "firebase-admin": "^11.11.0",
    "ws": "^8.14.2",
    "chart.js": "^4.4.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "concurrently": "^7.6.0",
    "nodemon": "^2.0.22"
  }
}
```

**Sistema de Compilación (Paradigmas)**
```bash
# MPI
mpicc --version
# OpenMP
gcc --version
# Haskell
ghc --version
# Prolog
swipl --version
```

### 5.2 Instalación Paso a Paso

#### 5.2.1 Clonación y Configuración Inicial

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/monitoreo-consumo-paradigmas.git
cd monitoreo-consumo-paradigmas

# 2. Instalar dependencias Node.js
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

#### 5.2.2 Configuración de Firebase

**Creación de Proyecto Firebase**
1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Crear nuevo proyecto "Monitoreo-Consumo"
3. Habilitar Realtime Database
4. Generar credenciales de administrador

**Configuración de Reglas de Seguridad**
```json
{
  "rules": {
    "monitoreo_consumo": {
      "oficinas": {
        "$oficina": {
          "avisos": {
            ".read": true,
            ".write": "auth != null"
          },
          "resumenes": {
            ".read": true,
            ".write": "auth != null"
          }
        }
      }
    }
  }
}
```

#### 5.2.3 Configuración MQTT (Mosquitto)

**Instalación en Ubuntu/Debian**
```bash
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients

# Configuración básica
sudo nano /etc/mosquitto/mosquitto.conf

# Agregar:
listener 1883
allow_anonymous true
```

**Instalación en Windows**
1. Descargar Mosquitto desde https://mosquitto.org/download/
2. Instalar como servicio Windows
3. Configurar archivo mosquitto.conf

### 5.3 Configuración de los Componentes

#### 5.3.1 Servidor WebSocket

**Archivo de Configuración** (`socket.js`)
```javascript
const PORT_WS = process.env.WS_PORT || 8081;
const MQTT_BROKER = process.env.MQTT_BROKER || 'tcp://localhost:1883';
const FIREBASE_CONFIG = {
    credential: applicationDefault(),
    databaseURL: process.env.FIREBASE_URL
};
```

**Inicialización del Servidor**
```javascript
server.listen(PORT_WS, () => {
    console.log('✅ Servidor WebSocket escuchando en puerto', PORT_WS);
    console.log('✅ Servidores WebSocket listos:');
    console.log('   📊 ws://localhost:8081/ws/resumenes');
    console.log('   🔔 ws://localhost:8081/ws/avisos');
    console.log('   💡 ws://localhost:8081/ws/dispositivos');
});
```

#### 5.3.2 Simulador de Sensores (Publisher)

**Configuración de Oficinas** (`main.go`)
```go
var oficinas = []string{"A", "B", "C"}
var params ParametrosConfig = ParametrosConfig{
    HoraInicio:          8.0,
    HoraFin:             20.0,
    UmbralTemperaturaAC: 25.0,
    UmbralCorriente:     21.5,
    Voltaje:             220.0,
    CostoKwh:            0.25,
}
```

**Configuración MQTT Publisher**
```go
opciones := mqtt.NewClientOptions().
    AddBroker("tcp://localhost:1883").
    SetClientID("publicador-sensores")
```

#### 5.3.3 Dashboard Frontend

**Configuración de Conexiones** (`dashboard-enhanced.js`)
```javascript
this.WS_BASE_URL = 'ws://localhost:8081';
this.FIREBASE_CONFIG = {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789"
};
```

### 5.4 Verificación de la Instalación

#### 5.4.1 Script de Verificación

```bash
#!/bin/bash
# verification_script.sh

echo "🔍 Verificando instalación del sistema..."

# Verificar Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js $(node -v) instalado"
else
    echo "❌ Node.js no encontrado"
    exit 1
fi

# Verificar Go
if command -v go &> /dev/null; then
    echo "✅ Go $(go version) instalado"
else
    echo "❌ Go no encontrado"
    exit 1
fi

# Verificar servicios
echo "📊 Verificando servicios..."
curl -s http://localhost:8080 > /dev/null && echo "✅ Dashboard HTTP funcionando" || echo "❌ Dashboard no responde"
curl -s http://localhost:8081 > /dev/null && echo "✅ WebSockets funcionando" || echo "❌ WebSockets no responden"

echo "🎉 Verificación completada!"
```

#### 5.4.2 Pruebas de Funcionalidad

**Prueba de Sensores**
```bash
# Suscribirse a topics MQTT para ver datos
mosquitto_sub -h localhost -t "oficinas/+/sensores"
```

**Prueba WebSocket**
```javascript
// En consola del navegador
const ws = new WebSocket('ws://localhost:8081/ws/resumenes');
ws.onmessage = (event) => console.log('Datos recibidos:', JSON.parse(event.data));
```

**Prueba Firebase**
```javascript
// Verificar conexión a Firebase
import { initializeApp } from 'firebase/app';
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase conectado correctamente');
```

---

## 6. MANUAL DE USUARIO

### 6.1 Primeros Pasos

#### 6.1.1 Acceso al Sistema

**URL de Acceso**
```
http://localhost:8080
```

**Pantalla de Inicio**
- Dashboard principal con resumen general
- Panel lateral con oficinas monitoreadas
- Gráficos en tiempo real
- Panel de eventos y alertas

#### 6.1.2 Navegación Principal

**Barra de Navegación Superior**
- **Título del Sistema**: Muestra el nombre y estado
- **Selector de Tema**: Intercambiar entre modo claro/oscuro
- **Botones de Acción**: Agregar oficina, configuración del sistema

**Navbar Temático**
- **Computación Paralela**: MPI y OpenMP
- **Programación Funcional**: Haskell
- **Programación Lógica**: Prolog
- **Análisis Integrado**: Comparativos y benchmarks

### 6.2 Monitoreo de Oficinas

#### 6.2.1 Panel de Resumen General

**Métricas Principales**
- **Consumo Total**: kWh consumidos en todas las oficinas
- **Costo Total**: Costo económico del consumo
- **Oficinas Activas**: Número de oficinas con datos
- **Ahorro Mensual**: Porcentaje de eficiencia estimado
- **CO₂ Evitado**: Impacto ambiental positivo
- **Tiempo Activo**: Tiempo total de operación del sistema

**Interpretación de Métricas**
```javascript
// Cálculo de eficiencia
calculateOfficeEfficiency(resumen) {
    const consumo = resumen.consumo_kvh || 0;
    const corriente = resumen.corriente_a || 0;
    const tiempo = resumen.tiempo_presente || 1;

    const baseEfficiency = Math.max(0, 100 - (consumo / tiempo) * 10);
    const currentEfficiency = Math.max(0, 100 - (corriente * 2));

    return (baseEfficiency + currentEfficiency) / 2;
}
```

#### 6.2.2 Tarjetas de Oficina Individuales

**Estructura de Información**
- **Header**: Nombre de oficina y eficiencia
- **Métricas Principales**: 6 indicadores clave
- **Información Adicional**: 6 datos complementarios
- **Dispositivos**: Estado de luces y aire acondicionado
- **Acciones**: Control directo y análisis detallado

**Estados de Eficiencia**
| Eficiencia | Color | Descripción |
|------------|-------|-------------|
| 90-100% | Verde Excelente | Operación óptima |
| 80-89% | Azul Buena | Buen desempeño |
| 60-79% | Amarillo Regular | Oportunidades de mejora |
| <60% | Rojo Pobre | Requiere atención |

### 6.3 Control de Dispositivos

#### 6.3.1 Control Manual

**Encendido/Apagado de Luces**
```javascript
toggleDispositivo(oficina, dispositivo, estado) {
    console.log(`Cambiando ${dispositivo} en ${oficina} a ${estado}`);
    this.showToast(`${dispositivo} ${estado ? 'activado' : 'desactivado'} en Oficina ${oficina}`, 'success');

    // Actualizar estado local
    if (!this.dispositivos[oficina]) {
        this.dispositivos[oficina] = {};
    }
    this.dispositivos[oficina][dispositivo] = estado;

    // Re-renderizar
    this.renderOficinas();
    this.updateQuickStats();
}
```

**Control de Aire Acondicionado**
- Activación automática por temperatura
- Control manual override
- Programación por horarios

#### 6.3.2 Automatización Inteligente

**Reglas de Automatización**
```prolog
% Reglas Prolog para automatización
encender_aire(Oficina) :-
    temperatura(Oficina, Temp),
    Temp > 25,
    presencia(Oficina, true),
    horario_laboral.

apagar_luces(Oficina) :-
    not presencia(Oficina, true),
    luces_encendidas(Oficina).
```

### 6.4 Sistema de Análisis por Paradigmas

#### 6.4.1 MPI - Procesamiento Distribuido

**Configuración de Simulación**
1. **Número de Nodos**: 2-16 nodos MPI
2. **Tamaño de Dataset**: 1K a 500K puntos
3. **Algoritmo**: Broadcast, Scatter/Gather, Reduce

**Interpretación de Resultados**
- **Speedup**: Aceleración vs procesamiento secuencial
- **Eficiencia**: Utilización efectiva de los nodos
- **Balance de Carga**: Distribución equitativa del trabajo

#### 6.4.2 OpenMP - Paralelización

**Estrategias de Scheduling**
- **Static**: Chunks de tamaño fijo
- **Dynamic**: Asignación dinámica según disponibilidad
- **Guided**: Chunks que disminuyen progresivamente
- **Auto**: Decisión automática del sistema

**Métricas de Rendimiento**
```javascript
calculateSchedulingPerformance(threads, scheduling, chunk) {
    const basePerformance = 0.8;
    const modifiers = {
        'static': chunk > 50 ? 0.95 : 0.85,
        'dynamic': 0.90,
        'guided': 0.92,
        'auto': 0.88
    };
    
    return basePerformance * (modifiers[scheduling] || 0.85) * (1 - (threads * 0.01));
}
```

#### 6.4.3 Haskell - Análisis Funcional

**Transformaciones Disponibles**
- **Map**: Aplicar función a cada elemento
- **Filter**: Filtrar por condiciones
- **Fold**: Agregación de valores
- **Scan**: Acumulación progresiva

**Pipeline de Análisis**
```haskell
-- Ejemplo pipeline funcional
analisisEnergetico = 
    filter (\cons -> cons > 0) 
    . map (\cons -> cons * costoKwh)
    . foldl (+) 0
```

#### 6.4.4 Prolog - Sistema de Reglas

**Bases de Conocimiento**
- **Eficiencia**: Reglas de optimización energética
- **Optimización**: Recomendaciones de ahorro
- **Anomalías**: Detección de comportamientos inusuales
- **Recomendaciones**: Sugerencias personalizadas

**Ejemplo de Consulta**
```prolog
?- recomendar_ahorro(Oficina, Recomendacion).
Recomendacion = 'apagar_luces_automaticamente',
Oficina = 'B'.
```

### 6.5 Sistema de Alertas y Eventos

#### 6.5.1 Tipos de Alertas

**Alertas de Consumo**
- Consumo por encima del umbral
- Patrones de consumo inusuales
- Dispositivos encendidos fuera de horario

**Alertas de Temperatura**
- Temperatura fuera de rangos óptimos
- Fallos en sistema de climatización
- Diferencias significativas entre oficinas

**Alertas del Sistema**
- Sensores no respondiendo
- Cortes de energía detectados
- Configuraciones subóptimas

#### 6.5.2 Gestión de Alertas

**Prioridades**
- **Alta (Rojo)**: Requiere acción inmediata
- **Media (Amarillo)**: Atención recomendada
- **Baja (Azul)**: Informativo

**Acciones sobre Alertas**
- **Reconocimiento**: Marcar como leída
- **Resolución**: Indicar problema solucionado
- **Escalación**: Derivar a personal especializado

### 6.6 Generación de Reportes

#### 6.6.1 Reportes Automáticos

**Reportes Diarios**
- Consumo total por oficina
- Eficiencia energética
- Eventos y alertas del día
- Recomendaciones de optimización

**Reportes Mensuales**
- Tendencia de consumo
- Ahorros realizados
- Comparativa con meses anteriores
- Análisis de cumplimiento de objetivos

#### 6.6.2 Reportes Personalizados

**Parámetros Configurables**
- Rango de fechas
- Oficinas específicas
- Métricas a incluir
- Formato de salida (PDF, CSV, JSON)

**Ejemplo de Configuración**
```javascript
const reportConfig = {
    fechaInicio: '2024-01-01',
    fechaFin: '2024-01-31',
    oficinas: ['A', 'B', 'C'],
    metricas: ['consumo_kvh', 'corriente_a', 'temperatura_promedio'],
    formato: 'pdf',
    incluirGraficos: true
};
```

---

## 7. API Y PROTOCOLOS

### 7.1 WebSocket API

#### 7.1.1 Endpoints Disponibles

**/ws/resumenes**
```javascript
// Mensaje de entrada
{
    "tipo": "resumenes",
    "data": {
        "A": {
            "timestamp": 1640995200,
            "corriente_a": 5.2,
            "consumo_kvh": 1.14,
            "consumo_total_kvh": 45.6,
            "min_temp": 22.5,
            "max_temp": 25.8,
            "tiempo_presente": 300,
            "monto_estimado": 0.29,
            "monto_total": 11.4
        }
        // ... más oficinas
    }
}
```

**/ws/avisos**
```javascript
{
    "tipo": "avisos",
    "data": [
        {
            "timestamp": 1640995200,
            "id_tipo": "1",
            "adicional": "Oficina A - Luces encendidas por detección de presencia"
        }
    ]
}
```

**/ws/dispositivos**
```javascript
{
    "tipo": "dispositivos",
    "data": {
        "A": {
            "aire": true,
            "luces": true
        }
    }
}
```

#### 7.1.2 Mensajes del Cliente al Servidor

**Actualización de Dispositivos**
```javascript
{
    "tipo": "actualizar_dispositivo",
    "oficina": "A",
    "dispositivo": "luces",
    "estado": false
}
```

**Actualización de Parámetros**
```javascript
{
    "tipo": "actualizar_params",
    "data": {
        "hora_inicio": 8.0,
        "hora_fin": 20.0,
        "umbral_temperatura_ac": 25.0,
        "umbral_corriente": 21.5,
        "voltaje": 220.0,
        "costo_kwh": 0.25
    }
}
```

### 7.2 MQTT Protocol

#### 7.2.1 Topics Structure

**Sensores Data**
```
oficinas/<oficina_id>/sensores
```

**Control Topics**
```
oficinas/<oficina_id>/dispositivos/<dispositivo>
```

**Configuration Topics**
```
sistema/configuracion
sistema/alertas
```

#### 7.2.2 Message Format

**Sensor Data Message**
```json
{
    "oficina": "A",
    "timestamp": 1640995200,
    "presencia": true,
    "corriente_a": 5.2,
    "temperatura": 23.5
}
```

**Device Control Message**
```json
{
    "oficina": "A",
    "dispositivo": "luces",
    "estado": true,
    "timestamp": 1640995200
}
```

### 7.3 Firebase API

#### 7.3.1 Database Structure

```javascript
{
    "monitoreo_consumo": {
        "oficinas": {
            "A": {
                "avisos": {
                    "-Nabc123": {
                        "timestamp": 1640995200,
                        "id_tipo": "1",
                        "adicional": "Mensaje de alerta"
                    }
                },
                "resumenes": {
                    "-Ndef456": {
                        "timestamp": 1640995200,
                        "corriente_a": 5.2,
                        "consumo_kvh": 1.14,
                        // ... más campos
                    }
                }
            }
        }
    }
}
```

#### 7.3.2 Query Examples

**Obtener Últimos Resúmenes**
```javascript
const ref = db.ref('monitoreo_consumo/oficinas/A/resumenes');
ref.orderByChild('timestamp').limitToLast(10).on('value', (snapshot) => {
    const data = snapshot.val();
    // Procesar datos
});
```

**Alertas No Resueltas**
```javascript
const ref = db.ref('monitoreo_consumo/oficinas/A/avisos');
ref.orderByChild('resuelto').equalTo(false).on('value', (snapshot) => {
    const alertasPendientes = snapshot.val();
});
```

### 7.4 REST API (Opcional)

#### 7.4.1 Endpoints HTTP

**GET /api/oficinas**
```javascript
// Response
{
    "oficinas": [
        {
            "id": "A",
            "nombre": "Oficina A",
            "sector": "Informática",
            "estado": "activa"
        }
    ]
}
```

**POST /api/dispositivos**
```javascript
// Request
{
    "oficina": "A",
    "dispositivo": "luces",
    "estado": false
}

// Response
{
    "success": true,
    "message": "Dispositivo actualizado correctamente"
}
```

**GET /api/reportes**
```javascript
// Query Parameters
?fecha_inicio=2024-01-01&fecha_fin=2024-01-31&oficinas=A,B,C

// Response
{
    "reporte": {
        "periodo": "2024-01-01 a 2024-01-31",
        "consumo_total": 156.8,
        "costo_total": 39.2,
        "oficinas": [
            {
                "id": "A",
                "consumo": 45.6,
                "eficiencia": 78.3
            }
        ]
    }
}
```

---

## 8. BASE DE DATOS Y ALMACENAMIENTO

### 8.1 Estructura de Firebase

#### 8.1.1 Esquema Principal

```javascript
monitoreo_consumo/
├── oficinas/
│   ├── A/
│   │   ├── avisos/
│   │   │   ├── -Nabc123/
│   │   │   │   ├── timestamp: 1640995200
│   │   │   │   ├── id_tipo: "1"
│   │   │   │   ├── adicional: "Mensaje alerta"
│   │   │   │   └── resuelto: false
│   │   │   └── ... más avisos
│   │   └── resumenes/
│   │       ├── -Ndef456/
│   │       │   ├── timestamp: 1640995200
│   │       │   ├── corriente_a: 5.2
│   │       │   ├── consumo_kvh: 1.14
│   │       │   ├── consumo_total_kvh: 45.6
│   │       │   ├── min_temp: 22.5
│   │       │   ├── max_temp: 25.8
│   │       │   ├── tiempo_presente: 300
│   │       │   ├── monto_estimado: 0.29
│   │       │   └── monto_total: 11.4
│   │       └── ... más resúmenes
│   ├── B/
│   └── C/
└── configuracion/
    ├── parametros/
    │   ├── hora_inicio: 8.0
    │   ├── hora_fin: 20.0
    │   ├── umbral_temperatura_ac: 25.0
    │   ├── umbral_corriente: 21.5
    │   ├── voltaje: 220.0
    │   └── costo_kwh: 0.25
    └── dispositivos_globales/
        ├── modo_ahorro: false
        └── notificaciones: true
```

#### 8.1.2 Tipos de Datos

**Datos de Sensores (Streaming)**
- Alta frecuencia (cada 10 segundos)
- Volumen: ~8.6K registros/día/oficina
- Retención: 30 días en Firebase + archivo histórico

**Resúmenes (Agregados)**
- Frecuencia: Cada minuto
- Volumen: ~1.4K registros/día/oficina
- Retención: 1 año

**Alertas y Eventos**
- Frecuencia: Cuando ocurren eventos
- Volumen: Variable, ~50-200/día
- Retención: 6 meses

### 8.2 Optimización de Consultas

#### 8.2.1 Indexación

**Índices Recomendados**
```json
{
  "rules": {
    "monitoreo_consumo": {
      "oficinas": {
        "$oficina": {
          "avisos": {
            ".indexOn": ["timestamp", "resuelto"]
          },
          "resumenes": {
            ".indexOn": ["timestamp"]
          }
        }
      }
    }
  }
}
```

#### 8.2.2 Estrategias de Paginación

**Consulta Paginada de Resúmenes**
```javascript
function getResumenesPaginados(oficina, pagina = 1, tamanoPagina = 50) {
    const ref = db.ref(`monitoreo_consumo/oficinas/${oficina}/resumenes`);
    const inicio = (pagina - 1) * tamanoPagina;
    
    return ref.orderByChild('timestamp')
              .limitToLast(tamanoPagina)
              .once('value')
              .then(snapshot => {
                  const resumenes = [];
                  snapshot.forEach(childSnapshot => {
                      resumenes.push({
                          id: childSnapshot.key,
                          ...childSnapshot.val()
                      });
                  });
                  return resumenes.reverse(); // Más recientes primero
              });
}
```

### 8.3 Backup y Recuperación

#### 8.3.1 Estrategias de Backup

**Backup Automático Diario**
```javascript
// Script de backup Firebase
const admin = require('firebase-admin');
const fs = require('fs');

async function backupFirebase() {
    const fecha = new Date().toISOString().split('T')[0];
    const ref = db.ref('monitoreo_consumo');
    
    const snapshot = await ref.once('value');
    const data = snapshot.val();
    
    fs.writeFileSync(
        `backups/backup-${fecha}.json`,
        JSON.stringify(data, null, 2)
    );
    
    console.log(`✅ Backup creado: backup-${fecha}.json`);
}
```

**Backup Incremental**
```javascript
// Backup solo de datos nuevos
async function backupIncremental(ultimoBackup) {
    const ref = db.ref('monitoreo_consumo/oficinas');
    const snapshot = await ref.orderByChild('timestamp')
                             .startAt(ultimoBackup + 1)
                             .once('value');
    
    return snapshot.val();
}
```

#### 8.3.2 Recuperación de Datos

**Restauración Completa**
```javascript
async function restoreBackup(archivoBackup) {
    const backupData = JSON.parse(fs.readFileSync(archivoBackup, 'utf8'));
    const ref = db.ref('monitoreo_consumo');
    
    await ref.set(backupData);
    console.log('✅ Datos restaurados correctamente');
}
```

**Recuperación Parcial**
```javascript
async function restoreOficina(archivoBackup, oficinaId) {
    const backupData = JSON.parse(fs.readFileSync(archivoBackup, 'utf8'));
    const ref = db.ref(`monitoreo_consumo/oficinas/${oficinaId}`);
    
    await ref.set(backupData.oficinas[oficinaId]);
    console.log(`✅ Oficina ${oficinaId} restaurada`);
}
```

---

## 9. SISTEMA DE SIMULACIÓN

### 9.1 Arquitectura del Simulador

#### 9.1.1 Componentes del Simulador

**Publisher Go** (`publisher/main.go`)
- Generación de datos de sensores simulados
- Publicación MQTT en tiempo real
- Configuración dinámica de parámetros

**Datos de Simulación** (`datosEjemplo` en socket.js)
- Conjunto de datos de ejemplo para desarrollo
- Actualización en tiempo real para pruebas
- Comportamientos realistas predefinidos

#### 9.1.2 Algoritmos de Simulación

**Comportamiento de Presencia**
```go
func DetectarPresencia(t time.Time) bool {
    dia := t.Weekday()
    hora := float64(t.Hour()) + float64(t.Minute())/100.0
    
    // Comportamiento laboral típico
    return dia >= time.Monday && dia <= time.Friday &&
        hora >= params.HoraInicio && hora < params.HoraFin
}
```

**Variación de Temperatura**
```go
func CalcularSiguienteTemperatura(prev float64) float64 {
    delta := (rand.Float64() * 2 * variacionMaxTemperatura) - variacionMaxTemperatura
    temp := prev + delta
    
    // Límites realistas
    if temp < 20.0 {
        temp = 20.0
    } else if temp > 30.0 {
        temp = 30.0
    }
    return temp
}
```

**Cálculo de Corriente**
```go
func CalcularCorriente(oficina string, presencia bool, temperatura float64) float64 {
    base := 0.5 + rand.Float64()*(3.0-0.5)
    
    if presencia {
        estado := obtenerEstadoDispositivos(oficina)
        
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
```

### 9.2 Escenarios de Simulación

#### 9.2.1 Escenarios Predefinidos

**Escenario Laboral Normal**
```javascript
const escenarioLaboral = {
    horario: { inicio: 8, fin: 20 },
    dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    comportamiento: {
        pico_manana: { hora: 9, duracion: 2, intensidad: 0.8 },
        pico_tarde: { hora: 14, duracion: 3, intensidad: 0.9 },
        normal: { intensidad: 0.6 }
    }
};
```

**Escenario Fin de Semana**
```javascript
const escenarioFinSemana = {
    horario: { inicio: 10, fin: 18 },
    dias: ['sabado', 'domingo'],
    comportamiento: {
        actividad_reducida: { intensidad: 0.3 },
        pico_medio_dia: { hora: 13, duracion: 2, intensidad: 0.5 }
    }
};
```

#### 9.2.2 Patrones Estacionales

**Verano vs Invierno**
```javascript
const patronesEstacionales = {
    verano: {
        temperatura_base: 26,
        variacion_diaria: 4,
        uso_aire: 0.7,
        uso_calefaccion: 0.1
    },
    invierno: {
        temperatura_base: 20,
        variacion_diaria: 3,
        uso_aire: 0.2,
        uso_calefaccion: 0.6
    }
};
```

### 9.3 Generación de Datos Sintéticos

#### 9.3.1 Distribuciones Probabilísticas

**Distribución Normal para Consumo**
```javascript
function generarConsumoNormal(media, desviacion) {
    // Algoritmo Box-Muller para distribución normal
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    
    const normal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return media + normal * desviacion;
}
```

**Distribución Poisson para Eventos**
```javascript
function generarEventosPoisson(lambda, tiempo) {
    // Lambda: tasa promedio de eventos por unidad de tiempo
    const eventos = [];
    let t = 0;
    
    while (t < tiempo) {
        const u = Math.random();
        t += -Math.log(u) / lambda;
        if (t < tiempo) {
            eventos.push(t);
        }
    }
    
    return eventos;
}
```

#### 9.3.2 Series Temporales Realistas

**Componentes de Series Temporales**
```javascript
function generarSerieTemporal(config) {
    const { longitud, tendencia, estacionalidad, ruido } = config;
    const serie = [];
    
    for (let t = 0; t < longitud; t++) {
        let valor = 0;
        
        // Tendencia lineal
        valor += tendencia * t;
        
        // Estacionalidad (diaria/semanal)
        valor += estacionalidad.amplitud * Math.sin(2 * Math.PI * t / estacionalidad.periodo);
        
        // Ruido aleatorio
        valor += (Math.random() - 0.5) * 2 * ruido;
        
        serie.push(Math.max(0, valor)); // Evitar valores negativos
    }
    
    return serie;
}
```

---

## 10. ANÁLISIS DE DATOS

### 10.1 Métricas y KPIs

#### 10.1.1 Métricas de Eficiencia Energética

**Intensidad de Uso Energético (EUI)**
```javascript
calculateEnergyUseIntensity(consumoKwh, areaM2) {
    return consumoKwh / areaM2;
}
```

**Factor de Carga**
```javascript
calculateLoadFactor(consumoPromedio, consumoMaximo) {
    return (consumoPromedio / consumoMaximo) * 100;
}
```

**Eficiencia de Equipos**
```javascript
calculateEquipmentEfficiency(consumoReal, consumoEsperado) {
    return (consumoEsperado / consumoReal) * 100;
}
```

#### 10.1.2 Indicadores de Sustentabilidad

**Huella de Carbono**
```javascript
calculateCarbonFootprint(consumoKwh, factorEmision = 0.5) {
    return consumoKwh * factorEmision; // kg CO₂
}
```

**Ahorro Energético**
```javascript
calculateEnergySavings(consumoActual, consumoLineaBase) {
    const ahorroAbsoluto = consumoLineaBase - consumoActual;
    const ahorroPorcentual = (ahorroAbsoluto / consumoLineaBase) * 100;
    
    return {
        absoluto: ahorroAbsoluto,
        porcentual: ahorroPorcentual,
        costoAhorrado: ahorroAbsoluto * this.config.costoKwh
    };
}
```

### 10.2 Detección de Anomalías

#### 10.2.1 Algoritmos de Detección

**Método de Z-Score**
```javascript
detectAnomaliesZScore(data, threshold = 2.5) {
    const mean = data.reduce((a, b) => a + b) / data.length;
    const std = Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length);
    
    return data.map(value => {
        const zScore = Math.abs((value - mean) / std);
        return {
            value,
            isAnomaly: zScore > threshold,
            zScore
        };
    });
}
```

**Algoritmo Isolation Forest**
```javascript
// Implementación simplificada
class IsolationForest {
    constructor(numTrees = 100, sampleSize = 256) {
        this.numTrees = numTrees;
        this.sampleSize = sampleSize;
        this.trees = [];
    }
    
    fit(data) {
        for (let i = 0; i < this.numTrees; i++) {
            const sample = this.getRandomSample(data, this.sampleSize);
            this.trees.push(this.buildTree(sample, 0, Math.ceil(Math.log2(sample.length))));
        }
    }
    
    predict(value) {
        const pathLengths = this.trees.map(tree => this.pathLength(value, tree));
        const averagePathLength = pathLengths.reduce((a, b) => a + b) / pathLengths.length;
        return Math.pow(2, -averagePathLength / this.cAverage(this.sampleSize));
    }
}
```

#### 10.2.2 Reglas de Negocio para Anomalías

**Consumo Fuera de Horario**
```prolog
consumo_fuera_horario(Oficina, Timestamp, Consumo) :-
    not horario_laboral(Timestamp),
    Consumo > 1.0,
    not limpieza_programada(Timestamp).
```

**Patrones Inusuales**
```prolog
patron_inusual(Oficina, Consumos) :-
    varianza_alta(Consumos, 2.5),
    not evento_especial(Oficina),
    not mantenimiento_programado.
```

### 10.3 Pronóstico y Predicción

#### 10.3.1 Modelos de Series Temporales

**Suavizado Exponencial**
```javascript
class ExponentialSmoothing {
    constructor(alpha = 0.3) {
        this.alpha = alpha;
        this.level = null;
    }
    
    predict(data) {
        if (this.level === null) {
            this.level = data[0];
        }
        
        const predictions = [];
        for (let i = 0; i < data.length; i++) {
            this.level = this.alpha * data[i] + (1 - this.alpha) * this.level;
            predictions.push(this.level);
        }
        
        return predictions;
    }
    
    forecast(steps) {
        const forecast = [];
        let currentLevel = this.level;
        
        for (let i = 0; i < steps; i++) {
            forecast.push(currentLevel);
        }
        
        return forecast;
    }
}
```

**ARIMA Simplificado**
```javascript
class SimpleARIMA {
    constructor(p = 1, d = 1, q = 1) {
        this.p = p; // AR order
        this.d = d; // Difference order
        this.q = q; // MA order
        this.coefficients = null;
    }
    
    difference(data, order = 1) {
        let diff = data;
        for (let i = 0; i < order; i++) {
            const temp = [];
            for (let j = 1; j < diff.length; j++) {
                temp.push(diff[j] - diff[j-1]);
            }
            diff = temp;
        }
        return diff;
    }
    
    fit(data) {
        const diffData = this.difference(data, this.d);
        // Implementación simplificada del fitting
        this.coefficients = this.estimateCoefficients(diffData);
    }
    
    predict(steps) {
        // Generar predicciones basadas en coeficientes
        return this.generatePredictions(steps);
    }
}
```

#### 10.3.2 Métricas de Evaluación de Pronósticos

**Error Cuadrático Medio (MSE)**
```javascript
calculateMSE(actual, predicted) {
    let sum = 0;
    for (let i = 0; i < actual.length; i++) {
        sum += Math.pow(actual[i] - predicted[i], 2);
    }
    return sum / actual.length;
}
```

**Error Absoluto Porcentual Medio (MAPE)**
```javascript
calculateMAPE(actual, predicted) {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < actual.length; i++) {
        if (actual[i] !== 0) {
            sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
            count++;
        }
    }
    
    return (sum / count) * 100;
}
```

---

## 11. SISTEMA DE ALERTAS

### 11.1 Arquitectura del Sistema de Alertas

#### 11.1.1 Componentes del Sistema

**Detección de Eventos**
- Monitoreo continuo de métricas
- Evaluación de reglas de negocio
- Análisis de patrones y tendencias

**Gestión de Alertas**
- Clasificación por prioridad
- Agrupación de alertas relacionadas
- Escalación automática

**Notificaciones**
- Múltiples canales de notificación
- Personalización de mensajes
- Confirmación de recepción

#### 11.1.2 Flujo de Procesamiento de Alertas

```
Evento → Detección → Clasificación → Agrupación → 
Notificación → Seguimiento → Resolución
```

### 11.2 Tipos de Alertas Implementadas

#### 11.2.1 Alertas por Umbral

**Configuración de Umbrales**
```javascript
const thresholdAlerts = {
    consumo_electrico: {
        warning: 15.0,  // Amperios
        critical: 21.5, // Amperios
        duration: 300   // Segundos antes de alerta
    },
    temperatura: {
        too_cold: 20.0,  // °C
        too_hot: 26.0,   // °C
        critical_high: 30.0 // °C
    },
    presencia: {
        unexpected_absence: 3600, // 1 hora
        unexpected_presence: 7200 // 2 horas fuera de horario
    }
};
```

**Evaluación de Umbrales**
```javascript
checkThresholdAlerts(sensorData, thresholds) {
    const alerts = [];
    
    // Verificar consumo eléctrico
    if (sensorData.corriente_a > thresholds.consumo_electrico.critical) {
        alerts.push({
            type: 'consumo_critico',
            severity: 'critical',
            message: `Consumo crítico detectado: ${sensorData.corriente_a}A`,
            office: sensorData.oficina,
            timestamp: sensorData.timestamp
        });
    }
    
    // Verificar temperatura
    if (sensorData.temperatura > thresholds.temperatura.critical_high) {
        alerts.push({
            type: 'temperatura_critica',
            severity: 'critical',
            message: `Temperatura crítica: ${sensorData.temperatura}°C`,
            office: sensorData.oficina,
            timestamp: sensorData.timestamp
        });
    }
    
    return alerts;
}
```

#### 11.2.2 Alertas por Comportamiento

**Detección de Cambios de Comportamiento**
```javascript
detectBehavioralChanges(currentData, historicalPatterns) {
    const alerts = [];
    const office = currentData.oficina;
    const currentHour = new Date(currentData.timestamp * 1000).getHours();
    
    // Comparar con patrón histórico para esta hora
    const historicalPattern = historicalPatterns[office]?.hourly[currentHour];
    if (historicalPattern) {
        const deviation = Math.abs(currentData.corriente_a - historicalPattern.average) / historicalPattern.average;
        
        if (deviation > 0.5) { // 50% de desviación
            alerts.push({
                type: 'comportamiento_anomalo',
                severity: 'warning',
                message: `Desviación del patrón normal: ${(deviation * 100).toFixed(1)}%`,
                office: office,
                timestamp: currentData.timestamp,
                deviation: deviation
            });
        }
    }
    
    return alerts;
}
```

### 11.3 Sistema de Notificaciones

#### 11.3.1 Canales de Notificación

**Notificaciones en Dashboard**
```javascript
showToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${this.getToastIcon(tipo)}"></i>
            <span>${mensaje}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}
```

**Notificaciones por Email**
```javascript
async sendEmailAlert(alert) {
    const emailData = {
        to: this.getRecipientsForAlert(alert),
        subject: `Alerta del Sistema - ${alert.office}`,
        template: 'alert',
        data: {
            alert: alert,
            timestamp: new Date(alert.timestamp * 1000).toLocaleString(),
            systemUrl: this.config.systemUrl
        }
    };
    
    try {
        await this.emailService.send(emailData);
        console.log(`✅ Email enviado para alerta: ${alert.type}`);
    } catch (error) {
        console.error(`❌ Error enviando email: ${error.message}`);
    }
}
```

#### 11.3.2 Políticas de Escalación

**Escalación por Tiempo**
```javascript
class EscalationPolicy {
    constructor() {
        this.rules = {
            critical: {
                initial: ['dashboard', 'email'],
                after_30_min: ['sms', 'phone_call'],
                after_60_min: ['escalate_to_manager']
            },
            warning: {
                initial: ['dashboard'],
                after_60_min: ['email'],
                after_120_min: ['sms']
            }
        };
    }
    
    getEscalationSteps(alert, currentTime) {
        const alertAge = currentTime - alert.timestamp;
        const rules = this.rules[alert.severity] || this.rules.warning;
        const steps = [];
        
        // Paso inicial
        steps.push(...rules.initial);
        
        // Escalación por tiempo
        if (alertAge > 30 * 60 && rules.after_30_min) {
            steps.push(...rules.after_30_min);
        }
        
        if (alertAge > 60 * 60 && rules.after_60_min) {
            steps.push(...rules.after_60_min);
        }
        
        if (alertAge > 120 * 60 && rules.after_120_min) {
            steps.push(...rules.after_120_min);
        }
        
        return [...new Set(steps)]; // Eliminar duplicados
    }
}
```

### 11.4 Gestión y Seguimiento de Alertas

#### 11.4.1 Estado de las Alertas

**Estados del Ciclo de Vida**
```javascript
const ALERT_STATES = {
    NEW: 'new',
    ACKNOWLEDGED: 'acknowledged',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
};
```

**Transiciones de Estado**
```javascript
class AlertStateMachine {
    constructor() {
        this.transitions = {
            [ALERT_STATES.NEW]: [ALERT_STATES.ACKNOWLEDGED, ALERT_STATES.RESOLVED],
            [ALERT_STATES.ACKNOWLEDGED]: [ALERT_STATES.IN_PROGRESS, ALERT_STATES.RESOLVED],
            [ALERT_STATES.IN_PROGRESS]: [ALERT_STATES.RESOLVED],
            [ALERT_STATES.RESOLVED]: [ALERT_STATES.CLOSED],
            [ALERT_STATES.CLOSED]: [] // Estado final
        };
    }
    
    canTransition(fromState, toState) {
        return this.transitions[fromState]?.includes(toState) || false;
    }
    
    transitionAlert(alert, newState, user) {
        if (!this.canTransition(alert.state, newState)) {
            throw new Error(`Transición inválida: ${alert.state} -> ${newState}`);
        }
        
        alert.state = newState;
        alert.updatedAt = Date.now();
        alert.updatedBy = user;
        
        this.recordStateChange(alert, newState, user);
    }
}
```

#### 11.4.2 Reportes de Alertas

**Métricas de Alertas**
```javascript
calculateAlertMetrics(alerts, timeRange) {
    const filteredAlerts = alerts.filter(alert => 
        alert.timestamp >= timeRange.start && alert.timestamp <= timeRange.end
    );
    
    return {
        total: filteredAlerts.length,
        bySeverity: this.groupBySeverity(filteredAlerts),
        byType: this.groupByType(filteredAlerts),
        averageResolutionTime: this.calculateAverageResolutionTime(filteredAlerts),
        escalationRate: this.calculateEscalationRate(filteredAlerts)
    };
}
```

**SLA de Alertas**
```javascript
calculateAlertSLA(alerts, timeRange) {
    const criticalAlerts = alerts.filter(alert => 
        alert.severity === 'critical' && 
        alert.timestamp >= timeRange.start
    );
    
    const respondedInTime = criticalAlerts.filter(alert => {
        const responseTime = alert.acknowledgedAt - alert.timestamp;
        return responseTime <= 5 * 60; // 5 minutos SLA
    });
    
    return {
        totalCritical: criticalAlerts.length,
        respondedInTime: respondedInTime.length,
        slaPercentage: (respondedInTime.length / criticalAlerts.length) * 100,
        metSLA: (respondedInTime.length / criticalAlerts.length) >= 0.95 // 95% SLA
    };
}
```

---

## 12. INTERFAZ DE USUARIO

### 12.1 Diseño y Experiencia de Usuario

#### 12.1.1 Principios de Diseño

**Glassmorphism Design System**
```css
:root[data-theme="light"] {
    --bg-primary: #f0f2f5;
    --bg-secondary: #ffffff;
    --bg-glass: rgba(255, 255, 255, 0.25);
    --bg-glass-hover: rgba(255, 255, 255, 0.35);
    --text-primary: #2d3748;
    --text-secondary: #4a5568;
    --accent-primary: #4361ee;
    --accent-secondary: #3a56d4;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --info: #3b82f6;
    --shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    --border-glass: 1px solid rgba(255, 255, 255, 0.18);
    --blur: blur(12px);
}
```

**Responsive Breakpoints**
```css
/* Tablets */
@media (max-width: 1024px) {
    .container {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
}

/* Mobile */
@media (max-width: 768px) {
    .offices-grid {
        grid-template-columns: 1fr;
    }
    
    .office-metrics-detailed {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Small Mobile */
@media (max-width: 480px) {
    .office-metrics-detailed {
        grid-template-columns: 1fr;
    }
}
```

#### 12.1.2 Navegación y Flujos

**Estructura de Navegación**
```javascript
setupNavbarInteractions() {
    // Manejar clicks en las opciones de paradigmas
    document.querySelectorAll('.paradigm-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const modalId = option.getAttribute('data-modal');
            const action = option.getAttribute('data-action');
            
            if (modalId) {
                this.openModal(modalId);
                this.closeAllDropdowns();
            } else if (action === 'benchmark') {
                this.openModal('modalOpenMP');
                setTimeout(() => {
                    this.benchmarkOpenMP();
                }, 500);
                this.closeAllDropdowns();
            }
        });
    });
}
```

### 12.2 Componentes de la Interfaz

#### 12.2.1 Tarjetas de Oficina

**Estructura HTML**
```html
<div class="office-card-detailed animate-in">
    <!-- Header -->
    <div class="office-header-detailed">
        <div>
            <h3 class="office-title-detailed">
                <i class="fas fa-building"></i> Oficina ${oficinaId}
                <div class="efficiency-badge-detailed ${eficienciaClase}">
                    <i class="fas fa-chart-line"></i> ${eficiencia.toFixed(1)}%
                </div>
            </h3>
        </div>
        <div class="office-status-detailed">
            <div class="status-dot-detailed ${this.getStatusClass(resumen)}"></div>
            <span class="status-text-detailed">${this.getStatusText(resumen)}</span>
        </div>
    </div>
    
    <!-- Métricas Principales -->
    <div class="office-metrics-detailed">
        <!-- 6 métricas con iconos y valores -->
    </div>
    
    <!-- Información Adicional -->
    <div class="office-additional-info">
        <!-- 6 datos complementarios -->
    </div>
    
    <!-- Control de Dispositivos -->
    <div class="devices-section-detailed">
        <!-- Estados y controles de luces y aire -->
    </div>
    
    <!-- Footer -->
    <div class="office-footer-detailed">
        <!-- Actualización y acciones -->
    </div>
</div>
```

#### 12.2.2 Sistema de Gráficos

**Inicialización de Gráficos**
```javascript
initializeCharts() {
    console.log('🎯 Inicializando gráficos...');

    try {
        this.initializeMainChart();
        this.initializeOfficeChart();
        this.initializeTempChart();
        this.initializeDeviceChart();
    } catch (error) {
        console.error('❌ Error inicializando gráficos:', error);
    }

    // Manejar estados de carga
    setTimeout(() => {
        this.handleChartLoading();
    }, 500);
}
```

**Actualización en Tiempo Real**
```javascript
updateCharts() {
    this.updateMainChart();
    this.updateOfficeChart();
    this.updateTempChart();
    this.updateDeviceChart();
}

updateMainChart() {
    if (!this.charts.main) return;

    const now = new Date();
    const timeLabel = now.toLocaleTimeString('es-AR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const totalConsumo = Object.values(this.resumenes).reduce((sum, resumen) => {
        return sum + (resumen.consumo_kvh || 0);
    }, 0);

    // Agregar nuevo dato
    this.charts.main.data.labels.push(timeLabel);
    this.charts.main.data.datasets[0].data.push(totalConsumo);

    // Mantener solo los últimos 20 puntos
    if (this.charts.main.data.labels.length > 20) {
        this.charts.main.data.labels.shift();
        this.charts.main.data.datasets[0].data.shift();
    }

    this.charts.main.update('none');
}
```

### 12.3 Sistema de Ayuda Integrado

#### 12.3.1 Modal de Ayuda

**Estructura del Help System**
```javascript
setupHelpSystem() {
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const helpNavBtns = document.querySelectorAll('.help-nav-item');
    const helpSections = document.querySelectorAll('.help-section');

    helpBtn.addEventListener('click', () => {
        helpModal.classList.add('active');
        this.updateHelpProgress();
    });

    helpNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            this.showHelpSection(section);
        });
    });

    // Inicializar primera sección
    this.showHelpSection('overview');
}
```

**Secciones de Ayuda**
- **Inicio Rápido**: Guía de primeros pasos
- **Arquitectura**: Explicación del sistema
- **Dashboard**: Uso de la interfaz principal
- **Paradigmas**: Explicación de los diferentes enfoques
- **Controles**: Gestión de dispositivos y configuraciones
- **Alertas**: Sistema de notificaciones
- **Tips Pro**: Consejos avanzados

#### 12.3.2 Tooltips y Guías Contextuales

**Sistema de Tooltips**
```javascript
showTooltip(element, message, position = 'top') {
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${position}`;
    tooltip.textContent = message;
    
    document.body.appendChild(tooltip);
    
    // Posicionamiento
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    switch (position) {
        case 'top':
            tooltip.style.left = `${rect.left + (rect.width - tooltipRect.width) / 2}px`;
            tooltip.style.top = `${rect.top - tooltipRect.height - 5}px`;
            break;
        case 'bottom':
            tooltip.style.left = `${rect.left + (rect.width - tooltipRect.width) / 2}px`;
            tooltip.style.top = `${rect.bottom + 5}px`;
            break;
    }
    
    // Auto-remover
    setTimeout(() => {
        if (tooltip.parentElement) {
            tooltip.remove();
        }
    }, 3000);
}
```

---

## 13. OPTIMIZACIONES Y MEJORAS

### 13.1 Optimizaciones de Rendimiento

#### 13.1.1 Frontend Optimizations

**Lazy Loading de Componentes**
```javascript
class LazyLoader {
    constructor() {
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            rootMargin: '50px',
            threshold: 0.1
        });
    }
    
    observe(element, loadCallback) {
        element.dataset.loadCallback = loadCallback;
        this.observer.observe(element);
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const loadCallback = element.dataset.loadCallback;
                
                if (loadCallback) {
                    loadCallback();
                    this.observer.unobserve(element);
                }
            }
        });
    }
}
```

**Memoización de Cálculos Costosos**
```javascript
class MemoizedCalculator {
    constructor() {
        this.cache = new Map();
    }
    
    calculateEfficiency(resumen) {
        const key = JSON.stringify(resumen);
        
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const consumo = resumen.consumo_kvh || 0;
        const corriente = resumen.corriente_a || 0;
        const tiempo = resumen.tiempo_presente || 1;

        const baseEfficiency = Math.max(0, 100 - (consumo / tiempo) * 10);
        const currentEfficiency = Math.max(0, 100 - (corriente * 2));
        const result = (baseEfficiency + currentEfficiency) / 2;
        
        this.cache.set(key, result);
        return result;
    }
    
    clearCache() {
        this.cache.clear();
    }
}
```

#### 13.1.2 Backend Optimizations

**Connection Pooling para MQTT**
```go
type MQTTConnectionPool struct {
    connections chan mqtt.Client
    config      *mqtt.ClientOptions
    size        int
}

func NewMQTTConnectionPool(size int, config *mqtt.ClientOptions) *MQTTConnectionPool {
    pool := &MQTTConnectionPool{
        connections: make(chan mqtt.Client, size),
        config:      config,
        size:        size,
    }
    
    // Inicializar conexiones
    for i := 0; i < size; i++ {
        client := mqtt.NewClient(config)
        if token := client.Connect(); token.Wait() && token.Error() == nil {
            pool.connections <- client
        }
    }
    
    return pool
}

func (p *MQTTConnectionPool) Get() mqtt.Client {
    return <-p.connections
}

func (p *MQTTConnectionPool) Put(client mqtt.Client) {
    p.connections <- client
}
```

**Batch Processing para Firebase**
```go
type FirebaseBatcher struct {
    batchSize    int
    maxWaitTime  time.Duration
    batch        map[string]interface{}
    lastFlush    time.Time
    db           *db.Ref
}

func (b *FirebaseBatcher) Add(path string, data interface{}) {
    b.batch[path] = data
    
    if len(b.batch) >= b.batchSize || time.Since(b.lastFlush) > b.maxWaitTime {
        b.Flush()
    }
}

func (b *FirebaseBatcher) Flush() error {
    if len(b.batch) == 0 {
        return nil
    }
    
    updates := make(map[string]interface{})
    for path, data := range b.batch {
        updates[path] = data
    }
    
    err := b.db.Update(updates)
    if err == nil {
        b.batch = make(map[string]interface{})
        b.lastFlush = time.Now()
    }
    
    return err
}
```

### 13.2 Mejoras de Escalabilidad

#### 13.2.1 Arquitectura Microservicios

**Service Discovery**
```javascript
class ServiceRegistry {
    constructor() {
        this.services = new Map();
    }
    
    registerService(name, url, healthCheck) {
        this.services.set(name, {
            url,
            healthCheck,
            lastHealthCheck: Date.now(),
            healthy: true
        });
    }
    
    async getService(name) {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service ${name} not found`);
        }
        
        // Verificar salud del servicio
        if (!service.healthy || Date.now() - service.lastHealthCheck > 30000) {
            const healthy = await this.checkHealth(service);
            service.healthy = healthy;
            service.lastHealthCheck = Date.now();
        }
        
        if (!service.healthy) {
            throw new Error(`Service ${name} is unhealthy`);
        }
        
        return service;
    }
}
```

**Load Balancer**
```javascript
class LoadBalancer {
    constructor(strategy = 'round-robin') {
        this.strategy = strategy;
        this.services = [];
        this.currentIndex = 0;
    }
    
    addService(service) {
        this.services.push(service);
    }
    
    getNextService() {
        if (this.services.length === 0) {
            throw new Error('No services available');
        }
        
        switch (this.strategy) {
            case 'round-robin':
                return this.roundRobin();
            case 'random':
                return this.random();
            case 'least-connections':
                return this.leastConnections();
            default:
                return this.roundRobin();
        }
    }
    
    roundRobin() {
        const service = this.services[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.services.length;
        return service;
    }
}
```

#### 13.2.2 Caching Distribuido

**Redis Cache Implementation**
```javascript
class DistributedCache {
    constructor(redisClient) {
        this.redis = redisClient;
        this.localCache = new Map();
        this.defaultTTL = 300; // 5 minutos
    }
    
    async get(key) {
        // Intentar cache local primero
        if (this.localCache.has(key)) {
            const item = this.localCache.get(key);
            if (item.expiry > Date.now()) {
                return item.value;
            } else {
                this.localCache.delete(key);
            }
        }
        
        // Intentar Redis
        try {
            const value = await this.redis.get(key);
            if (value) {
                const parsed = JSON.parse(value);
                this.setLocal(key, parsed, this.defaultTTL);
                return parsed;
            }
        } catch (error) {
            console.error('Redis error:', error);
        }
        
        return null;
    }
    
    async set(key, value, ttl = this.defaultTTL) {
        // Cache local
        this.setLocal(key, value, ttl);
        
        // Redis
        try {
            await this.redis.setex(key, ttl, JSON.stringify(value));
        } catch (error) {
            console.error('Redis set error:', error);
        }
    }
    
    setLocal(key, value, ttl) {
        this.localCache.set(key, {
            value,
            expiry: Date.now() + (ttl * 1000)
        });
    }
}
```

### 13.3 Seguridad y Auditoría

#### 13.3.1 Autenticación y Autorización

**JWT Authentication**
```javascript
class AuthService {
    constructor(secret) {
        this.secret = secret;
        this.users = new Map(); // En producción, usar base de datos
    }
    
    async login(username, password) {
        const user = await this.verifyUser(username, password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username,
                role: user.role 
            },
            this.secret,
            { expiresIn: '24h' }
        );
        
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        };
    }
    
    verifyToken(token) {
        try {
            return jwt.verify(token, this.secret);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}
```

**Role-Based Access Control**
```javascript
class RBAC {
    constructor() {
        this.roles = {
            admin: ['read', 'write', 'delete', 'manage_users'],
            operator: ['read', 'write'],
            viewer: ['read']
        };
    }
    
    can(role, action) {
        const permissions = this.roles[role];
        return permissions ? permissions.includes(action) : false;
    }
    
    middleware(requiredAction) {
        return (req, res, next) => {
            const userRole = req.user?.role;
            
            if (!userRole || !this.can(userRole, requiredAction)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            next();
        };
    }
}
```

#### 13.3.2 Auditoría y Logging

**Structured Logging**
```javascript
class Logger {
    constructor(serviceName) {
        this.serviceName = serviceName;
    }
    
    info(message, metadata = {}) {
        this.log('info', message, metadata);
    }
    
    error(message, error = null, metadata = {}) {
        const logData = { ...metadata };
        if (error) {
            logData.error = {
                message: error.message,
                stack: error.stack,
                code: error.code
            };
        }
        this.log('error', message, logData);
    }
    
    log(level, message, metadata) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            service: this.serviceName,
            message,
            ...metadata
        };
        
        // Console en desarrollo, servicio de logging en producción
        if (process.env.NODE_ENV === 'development') {
            console[level](JSON.stringify(logEntry, null, 2));
        } else {
            // Enviar a servicio de logging centralizado
            this.sendToLogService(logEntry);
        }
    }
}
```

**Audit Trail**
```javascript
class AuditTrail {
    constructor(db) {
        this.db = db;
    }
    
    async record(action, userId, resource, details = {}) {
        const auditRecord = {
            timestamp: new Date().toISOString(),
            action,
            userId,
            resource,
            details,
            ipAddress: this.getClientIP(),
            userAgent: this.getUserAgent()
        };
        
        await this.db.collection('audit_logs').insertOne(auditRecord);
    }
    
    async getAuditLogs(filters = {}, options = {}) {
        const query = this.buildQuery(filters);
        const cursor = this.db.collection('audit_logs')
            .find(query)
            .sort({ timestamp: -1 })
            .limit(options.limit || 100);
        
        return cursor.toArray();
    }
}
```

---

## 14. TROUBLESHOOTING

### 14.1 Problemas Comunes y Soluciones

#### 14.1.1 Conexión y Comunicación

**Problema: WebSocket no se conecta**
```javascript
// Diagnóstico
async diagnoseWebSocketConnection() {
    const tests = [
        { name: 'WebSocket Server', test: this.testWebSocketServer },
        { name: 'Firewall/Network', test: this.testNetworkConnectivity },
        { name: 'CORS Configuration', test: this.testCORS }
    ];
    
    for (const test of tests) {
        try {
            const result = await test.test();
            console.log(`✅ ${test.name}: ${result}`);
        } catch (error) {
            console.error(`❌ ${test.name}: ${error.message}`);
            return false;
        }
    }
    
    return true;
}

testWebSocketServer() {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket('ws://localhost:8081/ws/resumenes');
        const timeout = setTimeout(() => {
            reject(new Error('Timeout connecting to WebSocket'));
        }, 5000);
        
        ws.onopen = () => {
            clearTimeout(timeout);
            ws.close();
            resolve('Connected successfully');
        };
        
        ws.onerror = (error) => {
            clearTimeout(timeout);
            reject(new Error(`Connection failed: ${error.message}`));
        };
    });
}
```

**Problema: MQTT Connection Issues**
```bash
# Verificar broker Mosquitto
sudo systemctl status mosquitto

# Probar conexión MQTT
mosquitto_sub -h localhost -t "test" -v &
mosquitto_pub -h localhost -t "test" -m "hello"

# Ver logs de Mosquitto
sudo tail -f /var/log/mosquitto/mosquitto.log
```

#### 14.1.2 Rendimiento y Estabilidad

**Problema: Alta Memoria en Node.js**
```javascript
// Monitoring de memoria
class MemoryMonitor {
    constructor(thresholdMB = 500) {
        this.threshold = thresholdMB * 1024 * 1024; // Convertir a bytes
        this.startMonitoring();
    }
    
    startMonitoring() {
        setInterval(() => {
            const memoryUsage = process.memoryUsage();
            const usedMB = memoryUsage.heapUsed / 1024 / 1024;
            
            if (memoryUsage.heapUsed > this.threshold) {
                this.handleMemoryPressure(memoryUsage);
            }
            
            // Log usage cada 5 minutos
            if (Date.now() % (5 * 60 * 1000) === 0) {
                console.log(`Memory usage: ${usedMB.toFixed(2)} MB`);
            }
        }, 1000);
    }
    
    handleMemoryPressure(memoryUsage) {
        console.warn('⚠️ High memory usage detected:', {
            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
        });
        
        // Forzar garbage collection si está disponible
        if (global.gc) {
            global.gc();
        }
        
        // Limpiar caches
        this.clearCaches();
    }
}
```

**Problema: Firebase Connection Drops**
```javascript
// Manejo de reconexión Firebase
class FirebaseConnectionManager {
    constructor() {
        this.connectionStates = {
            connected: false,
            lastConnected: null,
            retryCount: 0
        };
        
        this.setupConnectionMonitoring();
    }
    
    setupConnectionMonitoring() {
        const connectedRef = firebase.database().ref('.info/connected');
        
        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                this.connectionStates.connected = true;
                this.connectionStates.lastConnected = new Date();
                this.connectionStates.retryCount = 0;
                console.log('✅ Firebase connected');
            } else {
                this.connectionStates.connected = false;
                this.handleDisconnection();
            }
        });
    }
    
    handleDisconnection() {
        this.connectionStates.retryCount++;
        
        console.warn(`⚠️ Firebase disconnected. Retry count: ${this.connectionStates.retryCount}`);
        
        if (this.connectionStates.retryCount > 5) {
            this.attemptReconnection();
        }
    }
    
    attemptReconnection() {
        console.log('Attempting to reinitialize Firebase connection...');
        
        // Aquí iría la lógica de reconexión
        setTimeout(() => {
            this.initializeFirebase();
        }, 5000);
    }
}
```

### 14.2 Monitoreo y Métricas

#### 14.2.1 Health Checks

**Endpoint de Health Check**
```javascript
app.get('/health', (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {}
    };
    
    // Verificar WebSocket
    health.services.websocket = this.checkWebSocketHealth();
    
    // Verificar MQTT
    health.services.mqtt = this.checkMQTTHealth();
    
    // Verificar Firebase
    health.services.firebase = this.checkFirebaseHealth();
    
    // Verificar memoria
    health.memory = process.memoryUsage();
    
    // Determinar estado general
    const allHealthy = Object.values(health.services).every(service => service.healthy);
    health.status = allHealthy ? 'OK' : 'DEGRADED';
    
    res.status(allHealthy ? 200 : 503).json(health);
});
```

**Dashboard de Monitoreo**
```javascript
class MonitoringDashboard {
    constructor() {
        this.metrics = {
            requests: 0,
            errors: 0,
            responseTimes: [],
            activeConnections: 0
        };
        
        this.startMetricsCollection();
    }
    
    startMetricsCollection() {
        // Recolectar métricas cada 30 segundos
        setInterval(() => {
            this.collectMetrics();
        }, 30000);
    }
    
    collectMetrics() {
        const metricSnapshot = {
            timestamp: new Date().toISOString(),
            ...this.metrics,
            averageResponseTime: this.calculateAverageResponseTime(),
            errorRate: this.calculateErrorRate(),
            memoryUsage: process.memoryUsage()
        };
        
        // Enviar a servicio de métricas
        this.sendToMetricsService(metricSnapshot);
        
        // Reset contadores para siguiente período
        this.metrics.requests = 0;
        this.metrics.errors = 0;
        this.metrics.responseTimes = [];
    }
    
    recordRequest(duration) {
        this.metrics.requests++;
        this.metrics.responseTimes.push(duration);
    }
    
    recordError() {
        this.metrics.errors++;
    }
}
```

#### 14.2.2 Alertas de Sistema

**Monitor de Recursos**
```javascript
class SystemResourceMonitor {
    constructor() {
        this.thresholds = {
            cpu: 80,    // 80%
            memory: 85, // 85%
            disk: 90    // 90%
        };
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        setInterval(() => {
            this.checkCPUUsage();
            this.checkMemoryUsage();
            this.checkDiskUsage();
        }, 60000); // Cada minuto
    }
    
    async checkCPUUsage() {
        try {
            const usage = await this.getCPUUsage();
            if (usage > this.thresholds.cpu) {
                this.triggerAlert('high_cpu', `CPU usage at ${usage}%`);
            }
        } catch (error) {
            console.error('Error checking CPU usage:', error);
        }
    }
    
    async checkMemoryUsage() {
        const usage = process.memoryUsage();
        const percent = (usage.heapUsed / usage.heapTotal) * 100;
        
        if (percent > this.thresholds.memory) {
            this.triggerAlert('high_memory', `Memory usage at ${percent.toFixed(2)}%`);
        }
    }
}
```

---

## 15. REFERENCIAS TÉCNICAS

### 15.1 Especificaciones Técnicas

#### 15.1.1 Especificaciones de Hardware

**Requisitos de Servidor**
| Componente | Mínimo | Recomendado | Producción |
|------------|--------|-------------|------------|
| CPU | 2 cores | 4 cores | 8+ cores |
| RAM | 4 GB | 8 GB | 16 GB |
| Almacenamiento | 50 GB HDD | 100 GB SSD | 500 GB SSD |
| Red | 100 Mbps | 1 Gbps | 1 Gbps+ |

**Requisitos de Cliente**
| Navegador | Versión Mínima | Recomendada |
|-----------|----------------|-------------|
| Chrome | 90 | 100+ |
| Firefox | 85 | 95+ |
| Safari | 14 | 15+ |
| Edge | 90 | 100+ |

#### 15.1.2 Límites del Sistema

**Límites de Escalabilidad**
```javascript
const SYSTEM_LIMITS = {
    MAX_OFFICES: 100,
    MAX_SENSORS_PER_OFFICE: 50,
    MAX_CONCURRENT_USERS: 1000,
    MAX_DATA_POINTS_PER_DAY: 1000000,
    MAX_ALERTS_PER_HOUR: 1000,
    MAX_HISTORICAL_DATA: 365 // días
};
```

**Límites de Rendimiento**
```javascript
const PERFORMANCE_TARGETS = {
    DASHBOARD_LOAD_TIME: 3000, // ms
    DATA_UPDATE_INTERVAL: 10000, // ms
    WEBSOCKET_RECONNECT_DELAY: 3000, // ms
    FIREBASE_OPERATION_TIMEOUT: 5000, // ms
    MQTT_MESSAGE_TIMEOUT: 3000 // ms
};
```

### 15.2 Referencias de API

#### 15.2.1 WebSocket API Reference

**Mensajes de Entrada**
| Endpoint | Tipo | Estructura |
|----------|------|------------|
| /ws/resumenes | resumenes | `{tipo: "resumenes", data: Object}` |
| /ws/avisos | avisos | `{tipo: "avisos", data: Array}` |
| /ws/dispositivos | dispositivos | `{tipo: "dispositivos", data: Object}` |

**Mensajes de Salida**
| Acción | Estructura |
|--------|------------|
| Actualizar dispositivo | `{tipo: "actualizar_dispositivo", oficina: string, dispositivo: string, estado: boolean}` |
| Actualizar parámetros | `{tipo: "actualizar_params", data: Object}` |

#### 15.2.2 Firebase Schema Reference

**Estructura de Datos**
```javascript
// Path: /monitoreo_consumo/oficinas/{oficinaId}/resumenes/{resumenId}
{
    timestamp: number,
    corriente_a: number,
    consumo_kvh: number,
    consumo_total_kvh: number,
    min_temp: number,
    max_temp: number,
    tiempo_presente: number,
    monto_estimado: number,
    monto_total: number
}

// Path: /monitoreo_consumo/oficinas/{oficinaId}/avisos/{avisoId}
{
    timestamp: number,
    id_tipo: string,
    adicional: string,
    resuelto: boolean,
    resuelto_por: string,
    resuelto_en: number
}
```

### 15.3 Guías de Desarrollo

#### 15.3.1 Estándares de Código

**JavaScript/TypeScript**
```javascript
// Convenciones de nomenclatura
const namingConventions = {
    variables: 'camelCase',
    constants: 'UPPER_SNAKE_CASE',
    functions: 'camelCase',
    classes: 'PascalCase',
    files: 'kebab-case'
};

// Estructura de componentes
class ComponentName {
    constructor() {
        // Inicialización
    }
    
    // Métodos públicos primero
    publicMethod() {
        // Implementación
    }
    
    // Métodos privados después
    #privateMethod() {
        // Implementación
    }
    
    // Getters y setters
    get property() {
        return this._property;
    }
    
    set property(value) {
        this._property = value;
    }
}
```

**Go Standards**
```go
// Convenciones de Go
package main

import (
    "fmt"
    "time"
)

// Estructuras con comentarios
type SensorData struct {
    Office     string  `json:"oficina"`
    Timestamp  int64   `json:"timestamp"`
    Presence   bool    `json:"presencia"`
    Current    float64 `json:"corriente_a"`
    Temperature float64 `json:"temperatura"`
}

// Funciones con documentación
// ProcessSensorData procesa los datos del sensor y devuelve métricas
func ProcessSensorData(data SensorData) (*Metrics, error) {
    // Validación de entrada
    if data.Office == "" {
        return nil, fmt.Errorf("office cannot be empty")
    }
    
    // Procesamiento
    metrics := &Metrics{
        Timestamp: data.Timestamp,
        Office:    data.Office,
    }
    
    return metrics, nil
}
```

#### 15.3.2 Guía de Contribución

**Proceso de Desarrollo**
1. **Fork** del repositorio
2. Crear **feature branch**: `git checkout -b feature/amazing-feature`
3. Commit de cambios: `git commit -m 'Add amazing feature'`
4. Push al branch: `git push origin feature/amazing-feature`
5. Crear **Pull Request**

**Requisitos de Calidad**
- ✅ Tests unitarios para nuevo código
- ✅ Documentación actualizada
- ✅ Revisión de código aprobada
- ✅ Pruebas de integración pasadas
- ✅ Compatibilidad con versiones anteriores

**Template de Pull Request**
```markdown
## Descripción
[Descripción clara y concisa de los cambios]

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Checklist
- [ ] Mi código sigue las guías de estilo
- [ ] He realizado self-review de mi código
- [ ] He comentado mi código donde sea necesario
- [ ] He añadido tests que prueban mi fix/feature
- [ ] Los tests pasan localmente
- [ ] He actualizado la documentación

## Screenshots (si aplica)
[Agregar screenshots de los cambios visuales]
```

---

## CONCLUSIÓN

Esta documentación proporciona una guía completa para entender, instalar, configurar, utilizar y mantener el Sistema de Monitoreo Energético Inteligente Multi-Paradigma. El sistema representa una solución moderna y escalable que combina tecnologías de vanguardia con principios de programación sólidos para abordar los desafíos del monitoreo energético en entornos corporativos.

### Próximos Pasos Recomendados

1. **Implementación Gradual**: Comenzar con una oficina piloto antes del despliegue completo
2. **Capacitación del Personal**: Entrenar al equipo en el uso del dashboard y sistema de alertas
3. **Monitoreo Continuo**: Establecer métricas de éxito y revisar regularmente
4. **Expansión de Funcionalidades**: Considerar integraciones con otros sistemas existentes
5. **Optimización Continua**: Revisar y ajustar configuraciones basadas en datos reales de uso

### Recursos Adicionales

- [Repositorio del Proyecto](https://github.com/joaquinkuster/Monitoreo-Consumo)
- [Documentación de Firebase](https://firebase.google.com/docs)
- [Guía de MQTT](https://mqtt.org/documentation)
- [Documentación de WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

Para soporte técnico o preguntas adicionales, contactar al equipo de desarrollo o consultar los issues en el repositorio del proyecto.