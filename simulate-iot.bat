@echo off
echo ========================================================
echo Simulating ESP32 OWC Microcontroller Telemetry
echo ========================================================
echo.

set ELECTRON_RUN_AS_NODE=1
"C:\Users\VB\AppData\Local\Programs\antigravity\Antigravity.exe" scripts/iot-telemetry-simulator.js

pause
