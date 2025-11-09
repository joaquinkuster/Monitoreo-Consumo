#!/bin/bash

echo "🚀 Iniciando Sistema de Monitoreo de Consumo..."

cleanup() {
    echo "🛑 Deteniendo todos los servicios..."
    taskkill //F //IM go.exe >/dev/null 2>&1
    taskkill //F //IM node.exe >/dev/null 2>&1
    taskkill //F //IM mosquitto.exe >/dev/null 2>&1
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "📡 Iniciando Mosquitto..."
./start-mosquitto.sh &
sleep 5

# Verificar si Mosquitto está ejecutándose
if ! tasklist //FI "IMAGENAME eq mosquitto.exe" 2>/dev/null | grep -q "mosquitto.exe"; then
    echo "❌ Error: No se pudo iniciar Mosquitto"
    exit 1
fi

echo "✅ Mosquitto iniciado"

echo "🔄 Iniciando componentes..."

echo "📊 Iniciando Publisher..."
cd mqtt/publisher
go run main.go &
PUBLISHER_PID=$!
cd ../..
sleep 3

echo "📥 Iniciando Subscriber..."
cd mqtt/subscriber
go run main.go &
SUBSCRIBER_PID=$!
cd ../..
sleep 3

echo "🔌 Iniciando WebSocket Server..."
node socket.js &
SOCKET_PID=$!
sleep 3

echo "🌐 Iniciando Dashboard..."
node dashboard.js &
DASHBOARD_PID=$!
sleep 5

echo ""
echo "✅ Todos los componentes iniciados correctamente!"
echo ""
echo "🌐 Abre tu navegador en: http://localhost:8080"
echo ""
echo "📈 El sistema está funcionando. Los datos comenzarán a aparecer en unos segundos."
echo ""
echo "💡 Presiona Ctrl+C para detener todos los servicios"

# Esperar indefinidamente
while true; do
    sleep 1
done