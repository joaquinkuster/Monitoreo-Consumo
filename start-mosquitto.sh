#!/bin/bash

echo "🚀 Iniciando Mosquitto MQTT Broker..."

# Verificar si Mosquitto ya está ejecutándose (compatible Windows/MINGW64)
if tasklist //FI "IMAGENAME eq mosquitto.exe" 2>/dev/null | grep -q "mosquitto.exe"; then
    echo "⚠️  Mosquitto ya está ejecutándose. Deteniendo..."
    taskkill //F //IM mosquitto.exe >/dev/null 2>&1
    sleep 2
fi

mkdir -p data/mosquitto
mkdir -p logs

echo "📡 Iniciando broker en localhost:1883..."
mosquitto -c config/mosquitto.conf -v