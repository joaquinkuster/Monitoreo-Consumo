@echo off
echo 🚀 Iniciando Mosquitto MQTT Broker...

REM Verificar si Mosquitto ya está ejecutándose
tasklist /FI "IMAGENAME eq mosquitto.exe" 2>NUL | find /I /N "mosquitto.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ⚠️  Mosquitto ya está ejecutándose. Deteniendo...
    taskkill /F /IM mosquitto.exe >NUL 2>&1
    timeout /t 2 /nobreak >NUL
)

REM Crear directorios si no existen
if not exist "data\mosquitto" mkdir data\mosquitto
if not exist "logs" mkdir logs

echo 📡 Iniciando broker en localhost:1883...
mosquitto -c config\mosquitto.conf -v