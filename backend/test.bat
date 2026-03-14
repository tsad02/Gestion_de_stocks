@echo off
REM Script de test de la Semaine 6 (Windows CMD)
REM Usage: double-cliquer ou: test.bat

cd /d "%~dp0"

echo.
echo ====================================================
echo  TEST AUTOMATISÉ - SEMAINE 6
echo ====================================================
echo.

echo [INFO] Assureez-vous que le serveur est démarré
echo [INFO] Lancez: start_server.bat dans un autre terminal
echo.

pause

node test_semaine_6.js

pause
