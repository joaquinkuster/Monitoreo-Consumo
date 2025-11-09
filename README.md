# Sistema de Monitoreo Energético - Multi-Paradigma

Un sistema avanzado de monitoreo de consumo eléctrico que integra múltiples paradigmas de programación (MPI, OpenMP, Haskell, Prolog) con tecnologías modernas para análisis en tiempo real y optimización energética.

## Características Principales

### Monitoreo en Tiempo Real
- **Sensores simulados** para presencia, corriente y temperatura
- **Broker MQTT** (Mosquitto) para comunicación descentralizada
- **WebSockets** para actualizaciones en tiempo real del dashboard
- **Firebase Realtime Database** para persistencia de datos

### Multi-Paradigma Integrado
- **MPI** - Procesamiento distribuido para análisis masivo
- **OpenMP** - Paralelización para procesamiento de streams
- **Haskell** - Análisis funcional puro de tendencias
- **Prolog** - Sistema de reglas inteligentes para recomendaciones
- **JavaScript/Node.js** - Dashboard interactivo con visualizaciones 3D

### Dashboard Avanzado
- **Visualizaciones 3D** con Chart.js y Three.js
- **Métricas de eficiencia** en tiempo real
- **Sistema de alertas** inteligente
- **Control remoto** de dispositivos (luces, aire acondicionado)
- **Análisis OLAP** para business intelligence

## Arquitectura del Sistema

```
Monitoreo-Consumo/
├── 📁 mqtt/
│   ├── 📁 publisher/          # Simulador de sensores (Go)
│   │   └── main.go
│   └── 📁 subscriber/         # Procesador de datos (Go + Firebase)
│       └── main.go
├── 📁 config/
│   ├── firebase-config.js     # Configuración Firebase
│   └── mosquitto.conf         # Configuración broker MQTT
├── 📁 resources/
│   ├── template.html          # Dashboard principal
│   ├── dashboard.js           # Servidor HTTP
│   ├── socket.js              # Servidor WebSocket
│   ├── 📁 assets/
│   │   ├── dashboard-enhanced.js  # Lógica del dashboard
│   │   ├── styles-modern.css      # Estilos glassmorphism
│   │   └── theme-toggle.js        # Control de temas
│   └── package.json           # Dependencias Node.js
├── 📁 credentials/
│   └── firebase-credentials.json  # Credenciales Firebase
├── 📁 logs/                   # Logs del sistema
├── 📁 data/                   # Datos persistentes Mosquitto
├── monitoreo.sh               # Script de gestión del sistema
└── semilla_firebase.js        # Inicialización de base de datos
```

## Instalación Rápida

### Prerrequisitos
```bash
# Go 1.16+
go version

# Node.js 14+
node --version

# Mosquitto MQTT Broker
mosquitto --version
```

### Configuración Inmediata
```bash
# 1. Clonar y configurar
git clone <tu-repositorio>
cd Monitoreo-Consumo

# 2. Configuración automática
./monitoreo.sh instalar

# 3. Colocar credenciales de Firebase en:
#    credentials/firebase-credentials.json
```

## Uso del Sistema

### Iniciar Todo el Sistema
```bash
./monitoreo.sh comenzar
```

### Ver Estado del Sistema
```bash
./monitoreo.sh estado
```

### Detener el Sistema
```bash
./monitoreo.sh parar
```

### Acceso al Dashboard
Una vez iniciado, abre tu navegador en:
```
http://localhost:8080
```

## 🔧 Componentes del Sistema

### 1. 📡 Publisher (Simulador de Sensores)
- **Lenguaje**: Go
- **Función**: Simula sensores de oficinas (A, B, C)
- **Datos generados**: Presencia, corriente, temperatura
- **Publicación**: Topics MQTT cada 10 segundos

### 2. 📥 Subscriber (Procesador de Datos)
- **Lenguaje**: Go + Firebase Admin SDK
- **Función**: Procesa datos MQTT y los almacena en Firebase
- **Características**: 
  - Detección de anomalías
  - Generación de resúmenes
  - Sistema de alertas inteligente

### 3. 🌐 Dashboard (Interfaz Web)
- **Tecnologías**: HTML5, CSS3, JavaScript, Chart.js, Three.js
- **Características**:
  - Glassmorphism design
  - Visualizaciones 3D interactivas
  - Control de dispositivos en tiempo real
  - Análisis multi-paradigma integrado

### 4. 🔌 WebSocket Server
- **Protocolo**: WebSocket en puerto 8081
- **Canales**: resumenes, avisos, dispositivos, params
- **Función**: Comunicación bidireccional dashboard-backend

## Características del Dashboard

### Visualizaciones
- **Gráfico principal** de consumo en tiempo real
- **Distribución 3D** por oficina
- **Temperaturas** con gráficos de barras
- **Métricas de eficiencia** con indicadores de tendencia

### Controles en Tiempo Real
- **Encendido/apagado** de luces por oficina
- **Control de aire acondicionado**
- **Configuración de umbrales** de consumo
- **Horarios laborales** personalizables

### Sistema de Alertas
- **Consumo anómalo** sin presencia
- **Cortes de energía** detectados
- **Sensores no responden**
- **Corriente elevada** por encima de umbral

## Integración Multi-Paradigma

### MPI - Procesamiento Distribuido
```bash
# Análisis distribuido de eficiencia
npm run compile-mpi
```

### OpenMP - Paralelización
```bash
# Procesamiento paralelo de streams
npm run compile-openmp
```

### Haskell - Análisis Funcional
```bash
# Análisis de tendencias funcional
npm run compile-haskell
```

### Prolog - Sistema de Reglas
```prolog
% Reglas inteligentes para optimización
:- consult('backend/prolog/energy_rules.pl').
```

## Configuración Avanzada

### Parámetros del Sistema
```javascript
{
  "hora_inicio": 8.0,           // Horario laboral inicio
  "hora_fin": 20.0,             // Horario laboral fin
  "umbral_temperatura_ac": 25.0, // Temp para activar AC
  "umbral_corriente": 21.5,     // Alerta de corriente
  "voltaje": 220.0,             // Voltaje de referencia
  "costo_kwh": 0.25             // Costo por kWh
}
```

### Personalización de Oficinas
```javascript
// Agregar nuevas oficinas desde el dashboard
{
  "A": { "nombre": "Oficina A", "sector": "Informática" },
  "B": { "nombre": "Oficina B", "sector": "Informática" },
  "C": { "nombre": "Oficina C", "sector": "Informática" }
}
```

## Solución de Problemas

### Error: Credenciales Firebase no encontradas
```bash
# Colocar el archivo en:
credentials/firebase-credentials.json
```

### Error: Puerto en uso
```bash
# Cambiar puertos en dashboard.js y socket.js
const PORT = 8080;  # Dashboard HTTP
const PORT = 8081;  # WebSocket Server
```

### Error: Mosquitto no inicia
```bash
# Verificar instalación de Mosquitto
mosquitto --version
# O usar: sudo apt-get install mosquitto
```

## Métricas y Análisis

El sistema proporciona:
- **Consumo total** en kWh y costos asociados
- **Eficiencia energética** por oficina (%)  
- **Tiempo de actividad** y patrones de uso
- **Ahorro estimado** y CO2 evitado
- **Tendencias** y predicciones de consumo

## Contribución

### Estructura de Desarrollo
```bash
# 1. Fork el proyecto
# 2. Crear feature branch
git checkout -b feature/nueva-caracteristica

# 3. Commit cambios
git commit -m "feat: agregar nueva característica"

# 4. Push al branch
git push origin feature/nueva-caracteristica

# 5. Crear Pull Request
```

### Áreas de Mejora
- [ ] Machine Learning para predicción de consumo
- [ ] Integración con hardware real (ESP32, Arduino)
- [ ] Análisis avanzado con Apache Spark
- [ ] Dashboard móvil responsive
- [ ] Exportación de reportes PDF/Excel

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Autores

- **Küster Joaquín** - Desarrollo backend y arquitectura
- **Da Silva Marcos** - Frontend y visualizaciones  
- **Martinez Lázaro Ezequiel** - Integración multi-paradigma

---

**🏢 Universidad Nacional de Misiones** - *Paradigmas y Lenguajes de Programación 2025*