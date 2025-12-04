# Instalación del Sistema

Esta guía te llevará paso a paso por la instalación y configuración del Sistema de Monitoreo de Consumo Eléctrico.

## Requisitos Previos

### Software Requerido

| Software | Versión Mínima | Propósito |
|----------|---------------|-----------|
| **Go** | 1.19+ | Publisher y Subscriber MQTT |
| **Node.js** | 14.0+ | WebSocket y HTTP servers |
| **Mosquitto** | 2.0+ | MQTT Broker |
| **Git** | 2.0+ | Control de versiones |
| **Firebase Account** | - | Base de datos en la nube |

### Verificar Instalaciones

```bash
# Verificar Go
go version
# Salida esperada: go version go1.24.2 windows/amd64

# Verificar Node.js
node --version
# Salida esperada: v18.x.x o superior

# Verificar npm
npm --version
# Salida esperada: 9.x.x o superior

# Verificar Mosquitto
mosquitto -h
# Debe mostrar ayuda de Mosquitto
```

## Instalación de Dependencias

### 1. Instalar Go

**Windows**:
```bash
# Descargar desde https://go.dev/dl/
# Ejecutar el instalador
# Verificar instalación
go version
```

**Linux/macOS**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install golang-go

# macOS (Homebrew)
brew install go
```

### 2. Instalar Node.js

**Windows**:
```bash
# Descargar desde https://nodejs.org/
# Ejecutar el instalador (incluye npm)
```

**Linux**:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS**:
```bash
brew install node
```

### 3. Instalar Mosquitto

**Windows**:
```bash
# Descargar desde https://mosquitto.org/download/
# Ejecutar instalador
# Agregar a PATH: C:\Program Files\mosquitto
```

**Linux**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mosquitto mosquitto-clients

# Habilitar servicio
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

**macOS**:
```bash
brew install mosquitto

# Iniciar servicio
brew services start mosquitto
```

## Configuración del Proyecto

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/monitoreo-consumo.git
cd monitoreo-consumo
```

### 2. Configurar Firebase

#### Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita **Realtime Database**
4. Configura reglas de seguridad (para desarrollo):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

#### Obtener Credenciales

1. En Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Descarga el archivo JSON
4. Guárdalo como `credentials/firebase-credentials.json`

```bash
# Crear directorio de credenciales
mkdir -p credentials

# Copiar archivo descargado
cp ~/Downloads/firebase-credentials.json credentials/
```

#### Actualizar URL de Firebase

Edita `socket.js` y `mqtt/subscriber/main.go` con tu URL:

```javascript
// socket.js
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://TU-PROYECTO-default-rtdb.firebaseio.com/"
});
```

```go
// mqtt/subscriber/main.go
clienteFirebase, err = app.DatabaseWithURL(ctx, 
    "https://TU-PROYECTO-default-rtdb.firebaseio.com/")
```

### 3. Ejecutar Script de Instalación

El sistema incluye un script automatizado que configura todo:

```bash
# Dar permisos de ejecución (Linux/macOS)
chmod +x monitoreo.sh

# Ejecutar instalación
./monitoreo.sh instalar
```

El script realizará:

<i class="fas fa-check-circle"></i> Verificación de dependencias (Go, Node.js, Mosquitto)  
<i class="fas fa-check-circle"></i> Creación de estructura de carpetas  
<i class="fas fa-check-circle"></i> Instalación de dependencias Go (`go mod tidy`)  
<i class="fas fa-check-circle"></i> Instalación de dependencias Node.js (`npm install`)  
<i class="fas fa-check-circle"></i> Generación de configuración de Mosquitto  

**Salida esperada**:

```
<i class="fas fa-rocket"></i> Configurando el sistema de Monitoreo de Consumo...
<i class="fas fa-check-circle"></i> Go encontrado: go version go1.24.2 windows/amd64
<i class="fas fa-check-circle"></i> Node.js encontrado: v18.17.0
<i class="fas fa-check-circle"></i> Mosquitto encontrado
📁 Creando estructura de carpetas...
<i class="fas fa-check-circle"></i> Credenciales Firebase encontradas
📦 Instalando dependencias Go...
<i class="fas fa-check-circle"></i> Dependencias Go instaladas
📦 Instalando dependencias Node.js...
<i class="fas fa-check-circle"></i> Dependencias Node.js instaladas
<i class="fas fa-file-alt"></i> Creando configuración Mosquitto...
<i class="fas fa-check-circle"></i> Configuración Mosquitto creada
<i class="fas fa-check-circle"></i> Configuración completada!

<i class="fas fa-bullseye"></i> Ahora puedes usar:
   ./monitoreo.sh comenzar  - Para iniciar el sistema
   ./monitoreo.sh estado    - Para ver el estado
   ./monitoreo.sh parar     - Para detener todo
```

### 4. Inicializar Base de Datos

Ejecuta el script de semilla para crear la estructura inicial en Firebase:

```bash
node semilla_firebase.js
```

Esto creará:
- Parámetros de configuración por defecto
- Tipos de avisos (13 tipos)
- Oficinas iniciales (A, B, C)

## Estructura de Carpetas

Después de la instalación, tendrás:

```
monitoreo-consumo/
├── backend/
│   └── mpi/
│       ├── mpi_analysis.c
│       └── test_data.json
├── config/
│   ├── firebase-config.js
│   └── mosquitto.conf
├── credentials/
│   └── firebase-credentials.json  ← Tu archivo
├── data/
│   └── mosquitto/                 ← Persistencia MQTT
├── logs/
│   └── mosquitto.log              ← Logs del broker
├── mqtt/
│   ├── publisher/
│   │   └── main.go
│   └── subscriber/
│       └── main.go
├── resources/
│   ├── assets/
│   └── template.html
├── dashboard.js
├── socket.js
├── semilla_firebase.js
├── monitoreo.sh
├── go.mod
├── go.sum
├── package.json
└── package-lock.json
```

## Configuración Avanzada

### Personalizar Parámetros

Edita `semilla_firebase.js` antes de ejecutarlo:

```javascript
const paramsPorDefecto = {
    hora_inicio: 8.0,          // Hora de inicio (8:00 AM)
    hora_fin: 20.0,            // Hora de fin (8:00 PM)
    umbral_temperatura_ac: 25.0, // °C para activar AC
    umbral_corriente: 21.5,    // Amperes máximos
    voltaje: 220.0,            // Voltaje de red
    costo_kwh: 0.25,           // Costo por kWh
};
```

### Configurar Mosquitto

El archivo `config/mosquitto.conf` se genera automáticamente, pero puedes personalizarlo:

```conf
listener 1883
allow_anonymous true

# Logs
log_dest file logs/mosquitto.log
log_type all

# Persistencia
persistence true
persistence_location data/mosquitto/

# Límites
max_connections 100
max_queued_messages 1000
max_packet_size 104857600
```

### Compilar Backend MPI (Opcional)

Si deseas usar el procesamiento paralelo:

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

## Verificación de Instalación

### Test de Componentes

```bash
# 1. Verificar que Mosquitto inicia
mosquitto -c config/mosquitto.conf -v
# Debe mostrar: "mosquitto version X.X.X running"

# 2. Verificar dependencias Node.js
cd Monitoreo-Consumo
npm list
# No debe mostrar errores

# 3. Verificar dependencias Go
cd mqtt/publisher
go build
cd ../subscriber
go build
# Ambos deben compilar sin errores
```

### Test de Conectividad Firebase

Crea un archivo `test-firebase.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./credentials/firebase-credentials.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://TU-PROYECTO-default-rtdb.firebaseio.com/"
});

const db = admin.database();
db.ref('test').set({ timestamp: Date.now() })
    .then(() => {
        console.log('<i class="fas fa-check-circle"></i> Conexión Firebase exitosa');
        process.exit(0);
    })
    .catch(err => {
        console.error('<i class="fas fa-times-circle"></i> Error:', err);
        process.exit(1);
    });
```

```bash
node test-firebase.js
```

## Solución de Problemas

### Error: "Mosquitto not found"

**Solución**:
```bash
# Verificar instalación
which mosquitto  # Linux/macOS
where mosquitto  # Windows

# Si no está en PATH, agregar manualmente
export PATH=$PATH:/usr/local/sbin  # Linux/macOS
```

### Error: "Firebase credentials not found"

**Solución**:
```bash
# Verificar que el archivo existe
ls -la credentials/firebase-credentials.json

# Verificar permisos
chmod 600 credentials/firebase-credentials.json
```

### Error: "Port 1883 already in use"

**Solución**:
```bash
# Ver qué proceso usa el puerto
lsof -i :1883  # Linux/macOS
netstat -ano | findstr :1883  # Windows

# Detener Mosquitto existente
sudo systemctl stop mosquitto  # Linux
brew services stop mosquitto   # macOS
taskkill /F /IM mosquitto.exe  # Windows
```

### Error: "Cannot find module 'firebase-admin'"

**Solución**:
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## Próximos Pasos

Una vez completada la instalación:

1. [Ejecutar el Sistema](/guide/running) - Aprende a iniciar todos los componentes
2. [Usar el Dashboard](/guide/usage) - Guía de uso del panel de control
3. [API Reference](/api/websocket) - Documentación técnica de endpoints

---

<div class="tip custom-block">
  <p class="custom-block-title"><i class="fas fa-lightbulb"></i> Consejo</p>
  <p>Guarda una copia de seguridad de tu archivo <code>firebase-credentials.json</code> en un lugar seguro. No lo subas a Git (ya está en .gitignore).</p>
</div>
