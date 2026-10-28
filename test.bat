@echo off
echo ========================================================
echo Running Shuchithwam IoT Verification Unit Tests
echo ========================================================
echo.

set ELECTRON_RUN_AS_NODE=1
"C:\Users\VB\AppData\Local\Programs\antigravity\Antigravity.exe" scripts/test-iot-verification.js

pause
