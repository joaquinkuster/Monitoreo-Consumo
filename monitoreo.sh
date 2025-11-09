#!/bin/bash

# monitoreo.sh - Sistema Unificado de Monitoreo de Consumo
# Uso:
#   ./monitoreo.sh instalar   - Primera configuración
#   ./monitoreo.sh comenzar   - Iniciar sistema completo
#   ./monitoreo.sh estado     - Ver estado de servicios
#   ./monitoreo.sh parar      - Detener todos los servicios

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables globales
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
CONFIG_DIR="$SCRIPT_DIR/config"
DATA_DIR="$SCRIPT_DIR/data"
CREDENTIALS_DIR="$SCRIPT_DIR/credentials"

# Funciones de utilidad
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar dependencias básicas
check_basic_deps() {
    if ! command -v go &> /dev/null; then
        print_error "Go no está instalado. Por favor instala Go 1.19+"
        return 1
    fi

    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 16+"
        return 1
    fi

    if ! command -v mosquitto &> /dev/null; then
        print_error "Mosquitto no está instalado. Por favor instala Mosquitto: https://mosquitto.org/download/"
        return 1
    fi

    return 0
}

# Función de instalación
instalar() {
    print_info "🚀 Configurando el sistema de Monitoreo de Consumo..."

    # Verificar dependencias
    if ! check_basic_deps; then
        exit 1
    fi

    print_success "Go encontrado: $(go version)"
    print_success "Node.js encontrado: $(node --version)"
    print_success "Mosquitto encontrado"

    # Crear estructura de carpetas
    print_info "📁 Creando estructura de carpetas..."
    mkdir -p "$CREDENTIALS_DIR"
    mkdir -p "$CONFIG_DIR"
    mkdir -p "$LOG_DIR"
    mkdir -p "$DATA_DIR/mosquitto"

    # Verificar credenciales Firebase
    if [ ! -f "$CREDENTIALS_DIR/firebase-credentials.json" ]; then
        print_error "No se encontró $CREDENTIALS_DIR/firebase-credentials.json"
        echo "📁 Por favor coloca tu archivo de credenciales en: $CREDENTIALS_DIR/firebase-credentials.json"
        exit 1
    fi

    print_success "Credenciales Firebase encontradas"

    # Instalar dependencias Go
    print_info "📦 Instalando dependencias Go..."
    go mod tidy
    if [ $? -eq 0 ]; then
        print_success "Dependencias Go instaladas"
    else
        print_error "Error instalando dependencias Go"
        exit 1
    fi

    # Instalar dependencias Node.js
    print_info "📦 Instalando dependencias Node.js..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencias Node.js instaladas"
    else
        print_error "Error instalando dependencias Node.js"
        exit 1
    fi

    # Crear configuración Mosquitto
    print_info "📄 Creando configuración Mosquitto..."
    cat > "$CONFIG_DIR/mosquitto.conf" << EOF
listener 1883
allow_anonymous true

log_dest file $LOG_DIR/mosquitto.log
log_type all

persistence true
persistence_location $DATA_DIR/mosquitto/

max_connections 100
max_queued_messages 1000
max_packet_size 104857600
EOF

    print_success "Configuración Mosquitto creada"

    print_success "✅ Configuración completada!"
    echo ""
    echo "🎯 Ahora puedes usar:"
    echo "   ./monitoreo.sh comenzar  - Para iniciar el sistema"
    echo "   ./monitoreo.sh estado    - Para ver el estado"
    echo "   ./monitoreo.sh parar     - Para detener todo"
}

# Función para iniciar Mosquitto
iniciar_mosquitto() {
    print_info "📡 Iniciando Mosquitto MQTT Broker..."

    # Verificar si Mosquitto ya está ejecutándose
    if tasklist //FI "IMAGENAME eq mosquitto.exe" 2>/dev/null | grep -q "mosquitto.exe"; then
        print_warning "Mosquitto ya está ejecutándose. Deteniendo..."
        taskkill //F //IM mosquitto.exe >/dev/null 2>&1
        sleep 2
    fi

    # Crear directorios necesarios
    mkdir -p "$DATA_DIR/mosquitto"
    mkdir -p "$LOG_DIR"

    # Iniciar Mosquitto en background
    mosquitto -c "$CONFIG_DIR/mosquitto.conf" -v &
    MOSQUITTO_PID=$!
    echo $MOSQUITTO_PID > "$DATA_DIR/mosquitto.pid"
    
    sleep 5

    # Verificar si se inició correctamente
    if tasklist //FI "IMAGENAME eq mosquitto.exe" 2>/dev/null | grep -q "mosquitto.exe"; then
        print_success "Mosquitto iniciado (PID: $MOSQUITTO_PID)"
        return 0
    else
        print_error "No se pudo iniciar Mosquitto"
        return 1
    fi
}

# Función para detener Mosquitto
detener_mosquitto() {
    if [ -f "$DATA_DIR/mosquitto.pid" ]; then
        local pid=$(cat "$DATA_DIR/mosquitto.pid")
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            print_success "Mosquitto detenido (PID: $pid)"
        else
            print_warning "Proceso Mosquitto no encontrado, forzando detención..."
        fi
        rm -f "$DATA_DIR/mosquitto.pid"
    fi

    # Forzar detención por nombre
    taskkill //F //IM mosquitto.exe >/dev/null 2>&1
}

# Función para iniciar el sistema completo
comenzar() {
    print_info "🚀 Iniciando Sistema de Monitoreo de Consumo..."

    # Verificar si ya está ejecutándose
    if [ -f "$DATA_DIR/running.pid" ]; then
        print_warning "El sistema parece estar ya en ejecución."
        echo "Usa './monitoreo.sh estado' para verificar o './monitoreo.sh parar' para detenerlo."
        exit 1
    fi

    # Función de limpieza
    cleanup() {
        print_info "🛑 Deteniendo todos los servicios..."
        
        # Guardar PIDs para detener
        if [ -f "$DATA_DIR/pids.txt" ]; then
            while read -r pid; do
                if kill -0 $pid 2>/dev/null; then
                    kill $pid 2>/dev/null
                fi
            done < "$DATA_DIR/pids.txt"
            rm -f "$DATA_DIR/pids.txt"
        fi

        # Detener Mosquitto
        detener_mosquitto

        # Forzar detención de procesos
        taskkill //F //IM go.exe >/dev/null 2>&1
        taskkill //F //IM node.exe >/dev/null 2>&1
        
        rm -f "$DATA_DIR/running.pid"
        print_success "Todos los servicios detenidos"
        exit 0
    }

    trap cleanup SIGINT SIGTERM

    # Iniciar Mosquitto
    if ! iniciar_mosquitto; then
        print_error "Error al iniciar Mosquitto. Abortando..."
        exit 1
    fi

    # Archivo para almacenar PIDs
    > "$DATA_DIR/pids.txt"

    # Iniciar componentes en orden
    print_info "🔄 Iniciando componentes..."

    print_info "🔌 Iniciando WebSocket Server..."
    node socket.js &
    SOCKET_PID=$!
    echo $SOCKET_PID >> "$DATA_DIR/pids.txt"
    sleep 5

    print_info "🌐 Iniciando Dashboard..."
    node dashboard.js &
    DASHBOARD_PID=$!
    echo $DASHBOARD_PID >> "$DATA_DIR/pids.txt"
    sleep 5

    print_info "📥 Iniciando Subscriber..."
    (cd mqtt/subscriber && go run main.go) &
    SUBSCRIBER_PID=$!
    echo $SUBSCRIBER_PID >> "$DATA_DIR/pids.txt"
    sleep 5

    print_info "📊 Iniciando Publisher..."
    (cd mqtt/publisher && go run main.go) &
    PUBLISHER_PID=$!
    echo $PUBLISHER_PID >> "$DATA_DIR/pids.txt"
    sleep 3

    # Marcar sistema como ejecutándose
    echo "$$" > "$DATA_DIR/running.pid"

    print_success "✅ Todos los componentes iniciados correctamente!"
    echo ""
    echo "🌐 Abre tu navegador en: http://localhost:8080"
    echo ""
    echo "📈 El sistema está funcionando. Esperando datos..."
    echo ""
    echo "💡 Presiona Ctrl+C para detener todos los servicios"

    # Esperar indefinidamente
    while true; do
        sleep 1
    done
}

# Función para ver estado
estado() {
    print_info "📊 Estado del Sistema de Monitoreo de Consumo"
    echo ""

    # Verificar Mosquitto
    if tasklist //FI "IMAGENAME eq mosquitto.exe" 2>/dev/null | grep -q "mosquitto.exe"; then
        print_success "Mosquitto: EJECUTÁNDOSE"
    else
        print_error "Mosquitto: DETENIDO"
    fi

    # Verificar procesos Node.js relacionados
    local node_count=$(tasklist //FI "IMAGENAME eq node.exe" 2>/dev/null | grep -c "node.exe")
    if [ "$node_count" -ge 2 ]; then
        print_success "Servicios Node.js: EJECUTÁNDOSE ($node_count procesos)"
    elif [ "$node_count" -eq 1 ]; then
        print_warning "Servicios Node.js: PARCIAL ($node_count proceso)"
    else
        print_error "Servicios Node.js: DETENIDOS"
    fi

    # Verificar procesos Go relacionados
    local go_count=$(tasklist //FI "IMAGENAME eq go.exe" 2>/dev/null | grep -c "go.exe")
    if [ "$go_count" -ge 2 ]; then
        print_success "Servicios Go: EJECUTÁNDOSE ($go_count procesos)"
    elif [ "$go_count" -eq 1 ]; then
        print_warning "Servicios Go: PARCIAL ($go_count proceso)"
    else
        print_error "Servicios Go: DETENIDOS"
    fi

    # Verificar si el sistema está marcado como ejecutándose
    if [ -f "$DATA_DIR/running.pid" ]; then
        local main_pid=$(cat "$DATA_DIR/running.pid")
        if kill -0 $main_pid 2>/dev/null; then
            print_success "Sistema principal: EJECUTÁNDOSE (PID: $main_pid)"
        else
            print_error "Sistema principal: PID HUÉRFANO"
            rm -f "$DATA_DIR/running.pid"
        fi
    else
        print_warning "Sistema principal: NO INICIADO"
    fi

    echo ""
    echo "💡 Usa './monitoreo.sh comenzar' para iniciar el sistema"
    echo "💡 Usa './monitoreo.sh parar' para detener todo"
}

# Función para detener todo
parar() {
    if [ ! -f "$DATA_DIR/running.pid" ]; then
        print_warning "El sistema no parece estar en ejecución."
        # Limpiar procesos huérfanos de todas formas
        detener_mosquitto
        taskkill //F //IM go.exe >/dev/null 2>&1
        taskkill //F //IM node.exe >/dev/null 2>&1
        print_success "Limpieza de procesos completada"
        return 0
    fi

    local main_pid=$(cat "$DATA_DIR/running.pid")
    print_info "🛑 Deteniendo Sistema de Monitoreo (PID: $main_pid)..."

    # Detener proceso principal
    if kill -0 $main_pid 2>/dev/null; then
        kill $main_pid
        sleep 2
    fi

    # Limpiar procesos restantes
    detener_mosquitto
    taskkill //F //IM go.exe >/dev/null 2>&1
    taskkill //F //IM node.exe >/dev/null 2>&1

    # Limpiar archivos PID
    rm -f "$DATA_DIR/running.pid"
    rm -f "$DATA_DIR/pids.txt"
    rm -f "$DATA_DIR/mosquitto.pid"

    print_success "✅ Todos los servicios detenidos"
}

# Función de ayuda
mostrar_ayuda() {
    echo "Sistema de Monitoreo de Consumo - Script de Control"
    echo ""
    echo "Uso: ./monitoreo.sh [COMANDO]"
    echo ""
    echo "Comandos disponibles:"
    echo "  instalar  - Configura el sistema por primera vez"
    echo "  comenzar  - Inicia todos los servicios del sistema"
    echo "  estado    - Muestra el estado actual de los servicios"
    echo "  parar     - Detiene todos los servicios"
    echo "  ayuda     - Muestra esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./monitoreo.sh instalar   # Primera configuración"
    echo "  ./monitoreo.sh comenzar   # Iniciar sistema"
    echo "  ./monitoreo.sh estado     # Ver estado"
    echo "  ./monitoreo.sh parar      # Detener todo"
}

# Main script
case "${1:-}" in
    instalar|install)
        instalar
        ;;
    comenzar|start|iniciar)
        comenzar
        ;;
    estado|status)
        estado
        ;;
    parar|stop|detener)
        parar
        ;;
    ayuda|help|--help|-h)
        mostrar_ayuda
        ;;
    *)
        print_error "Comando no reconocido: $1"
        echo ""
        mostrar_ayuda
        exit 1
        ;;
esac