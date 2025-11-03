@echo off
chcp 65001 >nul
echo 🚀 Iniciando Sistema de Monitoreo de Consumo...

REM Función de limpieza al cerrar
setlocal enabledelayedexpansion
for /f "tokens=2 delims=;=" %%a in ('"prompt $H & for %%b in (1) do rem"') do set "BS=%%a"

echo.
echo 📡 Iniciando Mosquitto...
start "Mosquitto Broker" /B cmd /c start-mosquitto-windows.bat
timeout /t 3 /nobreak >nul

REM Verificar si Mosquitto está ejecutándose
tasklist /FI "IMAGENAME eq mosquitto.exe" 2>NUL | find /I /N "mosquitto.exe">NUL
if not "%ERRORLEVEL%"=="0" (
    echo ❌ Error: No se pudo iniciar Mosquitto
    pause
    exit /b 1
)

echo ✅ Mosquitto iniciado
echo.

echo 🔄 Iniciando componentes...
echo.

echo 📊 Iniciando Publisher...
start "Publisher" /B cmd /c "cd publisher && go run main.go"
timeout /t 2 /nobreak >nul

echo 📥 Iniciando Subscriber...
start "Subscriber" /B cmd /c "cd subscriber && go run main.go"
timeout /t 2 /nobreak >nul

echo 🔌 Iniciando WebSocket Server...
start "WebSocket Server" /B cmd /c "node socket.js"
timeout /t 2 /nobreak >nul

echo 🌐 Iniciando Dashboard...
start "Dashboard" /B cmd /c "node dashboard.js"
timeout /t 3 /nobreak >nul

echo.
echo ✅ Todos los componentes iniciados correctamente!
echo.
echo 🌐 Abre tu navegador en: http://localhost:8080
echo.
echo 📈 El sistema está funcionando. Los datos comenzarán a aparecer en unos segundos.
echo.
echo 💡 Presiona cualquier tecla para detener todos los servicios...

pause >nul

echo.
echo 🛑 Deteniendo todos los servicios...
taskkill /F /IM mosquitto.exe >nul 2>&1
taskkill /F /IM go.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

echo ✅ Servicios detenidos.