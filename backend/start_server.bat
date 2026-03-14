@echo off
REM Script de démarrage du serveur (Windows CMD)
REM Usage: double-cliquer ou: start_server.bat

cd /d "%~dp0"

echo.
echo ====================================================
echo  DEMARRAGE DU SERVEUR GESTION STOCKS
echo ====================================================
echo.

REM Vérifier que node/npm sont disponibles
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installé
    echo Téléchargez depuis: https://nodejs.org/
    pause
    exit /b 1
)

REM Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Démarrer le serveur
echo.
echo [INFO] Démarrage du serveur sur http://localhost:3000
echo [INFO] Appuyez sur Ctrl+C pour arrêter
echo.

node src/server.js

pause
