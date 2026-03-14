@echo off
REM Script de démarrage des deux serveurs (backend + frontend)
REM Ouvrir deux fenêtres CMD une pour chaque serveur

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo =====================================
echo   Démarrage Tableau de Bord Semaine 7
echo =====================================
echo.

REM Ouvrir Terminal 1: Backend
echo 1️⃣  Démarrage du serveur Backend (port 3000)...
start cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak

REM Ouvrir Terminal 2: Frontend
echo 2️⃣  Démarrage du serveur Frontend (port 5173)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Les deux serveurs se lancent:
echo    - Backend:  http://localhost:3000
echo    - Frontend: http://localhost:5173
echo.
echo 💡 Le navigateur devrait s'ouvrir automatiquement
echo 📝 Voir STARTUP_GUIDE.md pour plus d'informations
echo.
