@echo off
chcp 65001 >nul
echo 🚀 Configurando el sistema de Monitoreo de Consumo...

REM Verificar Go
where go >nul 2>&1
if errorlevel 1 (
    echo ❌ Go no está instalado. Por favor instala Go 1.19+
    pause
    exit /b 1
)
echo ✅ Go encontrado

REM Verificar Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js 16+
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

REM Verificar Mosquitto
where mosquitto >nul 2>&1
if errorlevel 1 (
    echo 📦 Mosquitto no está instalado.
    echo 📖 Por favor instala Mosquitto manualmente: https://mosquitto.org/download/
    echo 📖 O usa: choco install mosquitto
    pause
    exit /b 1
)
echo ✅ Mosquitto encontrado

echo 📁 Creando estructura de carpetas...
if not exist "credentials" mkdir credentials
if not exist "config" mkdir config
if not exist "logs" mkdir logs
if not exist "data\mosquitto" mkdir data\mosquitto

if not exist "credentials\firebase-credentials.json" (
    echo ❌ No se encontró credentials\firebase-credentials.json
    echo 📁 Por favor coloca tu archivo de credenciales en: credentials\firebase-credentials.json
    pause
    exit /b 1
)

echo ✅ Credenciales Firebase encontradas

echo 📦 Instalando dependencias Go...
go mod tidy

echo 📦 Instalando dependencias Node.js...
cd resources && npm install && cd ..

echo 📄 Creando configuración Mosquitto...
(
echo listener 1883
echo allow_anonymous true
echo.
echo log_dest file ./logs/mosquitto.log
echo log_type all
echo.
echo persistence true
echo persistence_location ./data/mosquitto/
echo.
echo max_connections 100
echo max_queued_messages 1000
echo message_size_limit 0
) > config\mosquitto.conf

echo ✅ Configuración completada!
echo.
echo 🎯 Para ejecutar el sistema:
echo   1. Ejecuta: start-all-windows.bat
echo   2. O manualmente en terminales separadas:
echo      - start-mosquitto-windows.bat
echo      - cd publisher ^&^& go run main.go
echo      - cd subscriber ^&^& go run main.go
echo      - node socket.js
echo      - node dashboard.js
echo.
echo 🌐 Luego abre: http://localhost:8080

pause