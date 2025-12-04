---
layout: home

hero:
  name: "Monitoreo de Consumo Eléctrico"
  text: "Sistema Distribuido en Tiempo Real"
  tagline: |
    Monitoreo inteligente de consumo energético con arquitectura MQTT, WebSocket y procesamiento paralelo
    
    <i class="fas fa-book"></i> Paradigmas y Lenguajes de Programación 2025
    
    <i class="fas fa-users"></i> <a href="https://github.com/joaquinkuster" target="_blank">Küster Joaquín</a> • <a href="https://github.com/Marcos2497" target="_blank">Da Silva Marcos</a> • <a href="https://github.com/lazamartinez" target="_blank">Martinez Lázaro Ezequiel</a>
  image:
    src: /dashboard-cover.jpg
    alt: Sistema de Monitoreo - Dashboard
  actions:
    - theme: brand
      text: Comenzar
      link: /guide/introduction
    - theme: alt
      text: Ver en GitHub
      link: https://github.com

features:
  - icon: <i class="fas fa-bolt"></i>
    title: Monitoreo en Tiempo Real
    details: Visualización instantánea de consumo eléctrico, temperatura y presencia mediante WebSockets
  - icon: <i class="fas fa-chart-line"></i>
    title: Análisis Avanzado
    details: Procesamiento paralelo con MPI para análisis de eficiencia energética y clustering de consumo
  - icon: <i class="fas fa-sync-alt"></i>
    title: Arquitectura Distribuida
    details: Sistema basado en MQTT con Publisher/Subscriber en Go y backend Node.js
  - icon: <i class="fas fa-fire"></i>
    title: Firebase Integration
    details: Persistencia de datos en tiempo real con Firebase Realtime Database
  - icon: <i class="fas fa-chart-bar"></i>
    title: Visualizaciones Interactivas
    details: Gráficos dinámicos con Chart.js, ECharts y D3.js
  - icon: <i class="fas fa-bullseye"></i>
    title: Detección de Alertas
    details: Sistema inteligente de detección de anomalías y generación de avisos automáticos
---

## Arquitectura del Sistema

```mermaid
graph TB
    subgraph "Capa de Sensores"
        S1[Sensor Oficina A]
        S2[Sensor Oficina B]
        S3[Sensor Oficina C]
    end
    
    subgraph "Capa de Mensajería"
        MQTT[Mosquitto MQTT Broker]
        PUB[Go Publisher]
        SUB[Go Subscriber]
    end
    
    subgraph "Capa de Procesamiento"
        MPI[MPI Parallel Processing]
        WS[WebSocket Server]
        FB[Firebase Realtime DB]
    end
    
    subgraph "Capa de Presentación"
        DASH[Dashboard Frontend]
        CHARTS[Visualizaciones]
    end
    
    S1 --> PUB
    S2 --> PUB
    S3 --> PUB
    PUB --> MQTT
    MQTT --> SUB
    SUB --> FB
    SUB --> WS
    FB --> MPI
    WS --> DASH
    DASH --> CHARTS
    
    style MQTT fill:#ff6b6b
    style FB fill:#4ecdc4
    style DASH fill:#95e1d3
```

## Características Principales

### <i class="fas fa-plug"></i> Comunicación en Tiempo Real

El sistema utiliza **WebSockets** para transmitir datos en tiempo real desde el backend hacia el dashboard:

- `/ws/resumenes` - Resúmenes de consumo por oficina
- `/ws/avisos` - Alertas y notificaciones del sistema
- `/ws/dispositivos` - Estado de dispositivos (luces, aire acondicionado)
- `/ws/params` - Parámetros de configuración
- `/ws/oficinas` - Gestión de oficinas

### <i class="fas fa-broadcast-tower"></i> Arquitectura MQTT

Utiliza el patrón **Publisher/Subscriber** con Mosquitto:

```
oficinas/{id}/sensores
```

Cada mensaje contiene:
- Timestamp
- Presencia (boolean)
- Corriente (Amperes)
- Temperatura (°C)

### <i class="fas fa-rocket"></i> Inicio Rápido

```bash
# 1. Instalar dependencias
./monitoreo.sh instalar

# 2. Iniciar el sistema completo
./monitoreo.sh comenzar

# 3. Acceder al dashboard
# http://localhost:8080
```

## Componentes del Sistema

| Componente | Tecnología | Puerto | Descripción |
|------------|-----------|--------|-------------|
| MQTT Broker | Mosquitto | 1883 | Broker de mensajes |
| Publisher | Go | - | Simulación de sensores |
| Subscriber | Go | - | Procesamiento de datos |
| WebSocket Server | Node.js | 8081 | Distribución en tiempo real |
| Dashboard | Node.js | 8080 | Interfaz web |
| Firebase | Cloud | - | Base de datos |

## Flujo de Datos

1. **Generación**: El Publisher simula datos de sensores cada 10 segundos
2. **Publicación**: Los datos se publican en tópicos MQTT
3. **Suscripción**: El Subscriber recibe y procesa los mensajes
4. **Análisis**: Se detectan alertas y se generan resúmenes cada 60 segundos
5. **Persistencia**: Los datos se guardan en Firebase
6. **Distribución**: WebSocket transmite datos al dashboard
7. **Visualización**: El frontend muestra gráficos en tiempo real

## Próximos Pasos

<div class="tip custom-block">
  <p class="custom-block-title"><i class="fas fa-lightbulb"></i> Recomendación</p>
  <p>Comienza con la <a href="/guide/introduction">Guía de Introducción</a> para entender la arquitectura completa del sistema.</p>
</div>

---

<div style="text-align: center; margin-top: 3rem; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
  <h3>¿Listo para comenzar?</h3>
  <p>Explora la documentación completa y aprende a utilizar todas las características del sistema.</p>
  <a href="/guide/introduction" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 2rem; background: white; color: #667eea; border-radius: 8px; text-decoration: none; font-weight: bold;">Ir a la Guía →</a>
</div>
