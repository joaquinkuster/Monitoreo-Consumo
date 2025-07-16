# Monitoreo de Consumo Eléctrico

Este proyecto implementa un sistema de monitoreo de consumo eléctrico en una oficina utilizando Go, MQTT y Firebase RTDB. El sistema está diseñado para simular sensores, filtrar datos relevantes y proporcionar un tablero de control para la visualización del consumo eléctrico.

## Estructura del Proyecto

```
monitoreo_consumo
├── publisher
│   └── main.go          // Simula sensores y publica datos vía MQTT
├── edge
│   ├── main.go          // Intermediario que filtra y envía datos a Firebase
│   └── filter.go        // Funciones para filtrar datos relevantes
├── subscriber
│   └── main.go          // Se suscribe a MQTT y almacena datos en Firebase
├── dashboard
│   ├── main.go          // Punto de entrada para el tablero de monitoreo
│   ├── config.go        // Maneja la configuración del tablero
│   └── suggestions.go    // Genera sugerencias de ahorro energético
├── go.mod                // Módulo de Go que gestiona dependencias
└── README.md             // Documentación del proyecto
```

## Requisitos

- Go 1.16 o superior
- Un broker MQTT (ej. Mosquitto)
- Firebase configurado con las credenciales adecuadas

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   cd monitoreo_consumo
   ```

2. Instala las dependencias:
   ```
   go mod tidy
   ```

3. Configura Firebase y coloca el archivo de credenciales en la ruta correspondiente.

## Ejecución

1. Inicia el broker MQTT:
   ```
   mosquitto
   ```

2. Ejecuta el publicador para simular los sensores:
   ```
   go run publisher/main.go
   ```

3. Ejecuta el suscriptor para almacenar los datos en Firebase:
   ```
   go run subscriber/main.go
   ```

4. Ejecuta el intermediario en el edge:
   ```
   go run edge/main.go
   ```

5. Finalmente, ejecuta el tablero de monitoreo:
   ```
   go run dashboard/main.go
   ```

## Funcionalidades

- **Simulación de Sensores**: Genera datos de presencia, corriente y temperatura.
- **Filtrado de Datos**: Solo se almacenan datos relevantes en Firebase.
- **Alertas de Consumo**: Notificaciones si el consumo de corriente supera un umbral configurable.
- **Sugerencias de Ahorro Energético**: Recomendaciones para optimizar el uso de energía.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar el proyecto, por favor abre un issue o un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.