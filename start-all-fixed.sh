#!/bin/bash

echo "🚀 Iniciando Sistema de Monitoreo de Consumo (Versión Corregida)..."

cleanup() {
    echo "🛑 Deteniendo todos los servicios..."
    taskkill //F //IM go.exe >/dev/null 2>&1
    taskkill //F //IM node.exe >/dev/null 2>&1
    taskkill //F //IM mosquitto.exe >/dev/null 2>&1
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "📡 Verificando Mosquitto..."
if tasklist //FI "IMAGENAME eq mosquitto.exe" 2>/dev/null | grep -q "mosquitto.exe"; then
    echo "⚠️  Mosquitto ya está ejecutándose. Deteniendo..."
    taskkill //F //IM mosquitto.exe >/dev/null 2>&1
    sleep 2
fi

echo "📡 Iniciando Mosquitto..."
mosquitto -c config/mosquitto.conf -v &
sleep 5

echo "✅ Mosquitto iniciado"

echo "🔄 Iniciando componentes..."

echo "🔌 Iniciando WebSocket Server..."
node socket.js &
SOCKET_PID=$!
sleep 5

echo "🌐 Iniciando Dashboard..."
node dashboard.js &
DASHBOARD_PID=$!
sleep 5

echo "📥 Iniciando Subscriber..."
cd mqtt/subscriber
go run main.go &
SUBSCRIBER_PID=$!
cd ../..
sleep 5

echo "📊 Iniciando Publisher..."
cd mqtt/publisher
go run main.go &
PUBLISHER_PID=$!
cd ../..
sleep 3

echo ""
echo "✅ Todos los componentes iniciados correctamente!"
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