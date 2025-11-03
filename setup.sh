#!/bin/bash

echo "🚀 Configurando el sistema de Monitoreo de Consumo..."

if ! command -v go &> /dev/null; then
    echo "❌ Go no está instalado. Por favor instala Go 1.19+"
    exit 1
fi

echo "✅ Go encontrado: $(go version)"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 16+"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

if ! command -v mosquitto &> /dev/null; then
    echo "📦 Mosquitto no está instalado."
    echo "📖 Por favor instala Mosquitto manualmente: https://mosquitto.org/download/"
    exit 1
fi

echo "✅ Mosquitto encontrado"

echo "📁 Creando estructura de carpetas..."
mkdir -p credentials
mkdir -p config
mkdir -p logs
mkdir -p data/mosquitto

if [ ! -f "credentials/firebase-credentials.json" ]; then
    echo "❌ No se encontró credentials/firebase-credentials.json"
    echo "📁 Por favor coloca tu archivo de credenciales en: credentials/firebase-credentials.json"
    exit 1
fi

echo "✅ Credenciales Firebase encontradas"

echo "📦 Instalando dependencias Go..."
go mod tidy

echo "📦 Instalando dependencias Node.js..."
npm install

echo "📄 Creando configuración Mosquitto..."
cat > config/mosquitto.conf << EOF
listener 1883
allow_anonymous true

log_dest file ./logs/mosquitto.log
log_type all

persistence true
persistence_location ./data/mosquitto/

max_connections 100
max_queued_messages 1000
max_packet_size 104857600
EOF

echo "✅ Configuración completada!"
echo ""
echo "🎯 Para ejecutar el sistema:"
echo "   1. Terminal 1: ./start-mosquitto.sh"
echo "   2. Terminal 2: go run mqtt/publisher/main.go"
echo "   3. Terminal 3: go run mqtt/subscriber/main.go"
echo "   4. Terminal 4: node socket.js"
echo "   5. Terminal 5: node dashboard.js"
echo ""
echo "🌐 Luego abre: http://localhost:8080"
echo ""
echo "💡 O usa: ./start-all.sh para iniciar todo automáticamente"