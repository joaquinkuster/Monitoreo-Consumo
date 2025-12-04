# Sistema de Monitoreo de Consumo Eléctrico

> **Paradigmas y Lenguajes de Programación 2025**  
> **Trabajo Final**  
> **Autores**: Küster Joaquín • Da Silva Marcos • Martinez Lázaro Ezequiel

Sistema distribuido en tiempo real para monitoreo inteligente de consumo energético en múltiples oficinas, con arquitectura basada en MQTT, WebSocket y procesamiento paralelo.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Go](https://img.shields.io/badge/Go-1.19+-blue.svg)](https://golang.org/)

---

## Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Rápida](#-instalación-rápida)
- [Uso](#-uso)
- [Componentes del Sistema](#-componentes-del-sistema)
- [API Reference](#-api-reference)
- [Documentación Completa](#-documentación-completa)
- [Estructura del Proyecto](#️-estructura-del-proyecto)
- [Configuración Avanzada](#-configuración-avanzada)
- [Solución de Problemas](#-solución-de-problemas)
- [Scripts Disponibles](#-scripts-disponibles)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)
- [Autores](#-autores)
- [Agradecimientos](#-agradecimientos)

---


## Características Principales

-  **Monitoreo en Tiempo Real**: Visualización instantánea de consumo eléctrico, temperatura y presencia
-  **Análisis Avanzado**: Procesamiento paralelo con MPI para análisis de eficiencia energética
-  **Arquitectura Distribuida**: Sistema basado en MQTT Publisher/Subscriber con backend Node.js y Go
-  **Firebase Integration**: Persistencia de datos en tiempo real
-  **Visualizaciones Interactivas**: Gráficos dinámicos con Chart.js
-  **Detección Inteligente de Alertas**: Sistema automático de detección de anomalías

## Arquitectura del Sistema

```
┌─────────────┐     MQTT      ┌──────────────┐
│   Sensores  │──────────────▶│  Mosquitto   │
│  (Simulados)│               │    Broker    │
└─────────────┘               └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │ Go Publisher │  │ Go Subscriber│  │   Firebase   │
            │  (Simulador) │  │  (Procesador)│  │   Database   │
            └──────────────┘  └──────┬───────┘  └──────┬───────┘
                                     │                 │
                                     │                 │
                                     ▼                 ▼
                              ┌──────────────┐  ┌──────────────┐
                              │  WebSocket   │  │ MPI Backend  │
                              │    Server    │  │  (Análisis)  │
                              └──────┬───────┘  └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  Dashboard   │
                              │   Frontend   │
                              └──────────────┘
```

## Requisitos Previos

| Software | Versión Mínima | Propósito |
|----------|---------------|-----------|
| **Go** | 1.19+ | Publisher y Subscriber MQTT |
| **Node.js** | 14.0+ | WebSocket y HTTP servers |
| **Mosquitto** | 2.0+ | MQTT Broker |
| **Firebase Account** | - | Base de datos en la nube |

## Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/monitoreo-consumo.git
cd monitoreo-consumo
```

### 2. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita **Realtime Database**
3. Descarga las credenciales (Service Account Key)
4. Guarda el archivo como `credentials/firebase-credentials.json`

### 3. Ejecutar Instalación Automática

```bash
# Dar permisos de ejecución (Linux/macOS)
chmod +x monitoreo.sh

# Ejecutar instalación
./monitoreo.sh instalar
```

El script instalará automáticamente:
- ✅ Dependencias Go (`go mod tidy`)
- ✅ Dependencias Node.js (`npm install`)
- ✅ Configuración de Mosquitto
- ✅ Estructura de carpetas

### 4. Inicializar Base de Datos

```bash
node semilla_firebase.js
```

## Uso

### Iniciar el Sistema Completo

```bash
./monitoreo.sh comenzar
```

Esto iniciará automáticamente:
1. Mosquitto MQTT Broker (puerto 1883)
2. WebSocket Server (puerto 8081)
3. Dashboard HTTP Server (puerto 8080)
4. Go Subscriber (procesador de eventos)
5. Go Publisher (simulador de sensores)

### Acceder al Dashboard

Abre tu navegador en: **http://localhost:8080**

### Ver Estado del Sistema

```bash
./monitoreo.sh estado
```

### Detener el Sistema

```bash
./monitoreo.sh parar
```

O presiona `Ctrl+C` si lo iniciaste con `./monitoreo.sh comenzar`

## Componentes del Sistema

### Backend

#### 1. **MQTT Broker (Mosquitto)**
- Puerto: 1883
- Protocolo: MQTT v3.1.1
- Maneja comunicación pub/sub entre componentes

#### 2. **Go Publisher** (`mqtt/publisher/main.go`)
- Simula sensores de múltiples oficinas
- Publica datos cada 10 segundos
- Tópicos: `oficinas/{id}/sensores`

#### 3. **Go Subscriber** (`mqtt/subscriber/main.go`)
- Procesa mensajes MQTT
- Detecta 13 tipos de alertas
- Genera resúmenes cada 60 segundos
- Guarda datos en Firebase

#### 4. **WebSocket Server** (`socket.js`)
- Puerto: 8081
- Endpoints:
  - `/ws/resumenes` - Resúmenes de consumo
  - `/ws/avisos` - Alertas del sistema
  - `/ws/dispositivos` - Control de dispositivos
  - `/ws/params` - Configuración
  - `/ws/oficinas` - Gestión de oficinas

#### 5. **HTTP Server** (`dashboard.js`)
- Puerto: 8080
- Sirve el dashboard frontend

#### 6. **Firebase Realtime Database**
- Persistencia de datos
- Estructura: oficinas, avisos, resúmenes, configuración

#### 7. **MPI Backend** (`backend/mpi/mpi_analysis.c`)
- Procesamiento paralelo
- Análisis de eficiencia energética
- Clustering de consumo

### Frontend

#### Dashboard (`resources/template.html`)
- Visualización en tiempo real con Chart.js
- Control de dispositivos (luces, aire acondicionado)
- Gestión de oficinas
- Configuración de parámetros
- Tema claro/oscuro

## API Reference

### WebSocket Endpoints

#### `/ws/resumenes`
Resúmenes de consumo por oficina:
```json
{
  "tipo": "resumenes",
  "data": {
    "A": {
      "corriente_a": 12.5,
      "consumo_kvh": 2.75,
      "temperatura": 24.3,
      "monto_estimado": 0.69
    }
  }
}
```

#### `/ws/dispositivos`
Control de dispositivos:
```javascript
// Enviar
ws.send(JSON.stringify({
    tipo: 'actualizar_dispositivo',
    oficina: 'A',
    dispositivo: 'luces',
    estado: false
}));
```

### MQTT Topics

#### `oficinas/{id}/sensores`
Datos de sensores:
```json
{
  "oficina": "A",
  "timestamp": 1701648000,
  "presencia": true,
  "corriente_a": 12.5,
  "temperatura": 24.3
}
```

## Documentación Completa

Para documentación detallada, ejecuta:

```bash
cd docs
npm install
npm run docs:dev
```

Luego abre: **http://localhost:5173**

La documentación incluye:
- Guía de introducción
- Arquitectura detallada con diagramas Mermaid
- Instalación paso a paso
- Guía de ejecución
- Referencia completa de API WebSocket
- Referencia completa de API MQTT
- Ejemplos de código interactivos

## Estructura del Proyecto

```
monitoreo-consumo/
├── backend/
│   └── mpi/                    # Procesamiento paralelo MPI
│       ├── mpi_analysis.c
│       └── test_data.json
├── config/
│   ├── firebase-config.js
│   └── mosquitto.conf          # Configuración MQTT broker
├── credentials/
│   └── firebase-credentials.json  # Credenciales Firebase (no en Git)
├── data/
│   └── mosquitto/              # Persistencia MQTT
├── docs/                       # Documentación VitePress
│   ├── .vitepress/
│   ├── guide/
│   ├── api/
│   └── index.md
├── logs/
│   └── mosquitto.log
├── mqtt/
│   ├── publisher/              # Simulador de sensores (Go)
│   │   └── main.go
│   └── subscriber/             # Procesador de eventos (Go)
│       └── main.go
├── resources/
│   ├── assets/                 # CSS y JS del dashboard
│   └── template.html           # Dashboard frontend
├── dashboard.js                # Servidor HTTP
├── socket.js                   # Servidor WebSocket
├── semilla_firebase.js         # Script de inicialización DB
├── monitoreo.sh                # Script de control del sistema
├── go.mod
├── go.sum
├── package.json
└── README.md
```

## Configuración Avanzada

### Parámetros del Sistema

Edita `semilla_firebase.js` para personalizar:

```javascript
const paramsPorDefecto = {
    hora_inicio: 8.0,           // Hora de inicio (8:00 AM)
    hora_fin: 20.0,             // Hora de fin (8:00 PM)
    umbral_temperatura_ac: 25.0, // °C para activar AC
    umbral_corriente: 21.5,     // Amperes máximos
    voltaje: 220.0,             // Voltaje de red
    costo_kwh: 0.25,            // Costo por kWh
};
```

### Compilar Backend MPI (Opcional)

```bash
# Instalar OpenMPI
sudo apt install openmpi-bin libopenmpi-dev  # Linux
brew install open-mpi                         # macOS

# Compilar
cd backend/mpi
mpicc -o mpi_analysis mpi_analysis.c -ljansson -lm

# Ejecutar con 4 procesos
mpirun -np 4 ./mpi_analysis test_data.json
```

## Solución de Problemas

### Dashboard no carga

```bash
# Verificar que los servidores estén corriendo
./monitoreo.sh estado

# Reiniciar sistema
./monitoreo.sh parar
./monitoreo.sh comenzar
```

### Error de conexión a Firebase

```bash
# Verificar credenciales
ls -la credentials/firebase-credentials.json

# Verificar formato JSON
cat credentials/firebase-credentials.json | jq .
```

### Puerto 1883 en uso

```bash
# Ver qué proceso usa el puerto
lsof -i :1883  # Linux/macOS
netstat -ano | findstr :1883  # Windows

# Detener Mosquitto existente
sudo systemctl stop mosquitto  # Linux
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `./monitoreo.sh instalar` | Instalación inicial del sistema |
| `./monitoreo.sh comenzar` | Iniciar todos los componentes |
| `./monitoreo.sh estado` | Ver estado de servicios |
| `./monitoreo.sh parar` | Detener todos los servicios |
| `./monitoreo.sh ayuda` | Mostrar ayuda |
| `node semilla_firebase.js` | Inicializar base de datos |
| `cd docs && npm run docs:dev` | Ejecutar documentación |

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## Autores

**Trabajo Final - Paradigmas y Lenguajes de Programación 2025**

- **[Küster Joaquín](https://github.com/joaquinkuster)** - [@joaquinkuster](https://github.com/joaquinkuster)
- **[Da Silva Marcos](https://github.com/Marcos2497)** - [@Marcos2497](https://github.com/Marcos2497)
- **[Martinez Lázaro Ezequiel](https://github.com/lazamartinez)** - [@lazamartinez](https://github.com/lazamartinez)

### Institución
Universidad Nacional de Misiones (UNAM)  
Facultad de Ciencias Exactas Quimicas y Naturales


## Agradecimientos

- [Eclipse Paho](https://www.eclipse.org/paho/) - Cliente MQTT
- [Firebase](https://firebase.google.com/) - Base de datos en tiempo real
- [Chart.js](https://www.chartjs.org/) - Visualizaciones
- [Mosquitto](https://mosquitto.org/) - MQTT Broker
- [VitePress](https://vitepress.dev/) - Documentación

---

<div align="center">
  <strong>¿Listo para comenzar?</strong><br>
  Ejecuta <code>./monitoreo.sh instalar</code> y luego <code>./monitoreo.sh comenzar</code>
</div>
