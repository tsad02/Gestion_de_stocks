@echo off
move "c:\Users\PC\Documents\Hiver 2026\Gestion_de_stocks\frontend\logo.png" "c:\Users\PC\Documents\Hiver 2026\Gestion_de_stocks\frontend\public\logo.png"
if %errorlevel% neq 0 (
    echo Error: %errorlevel% > error.txt
) else (
    echo Success > success.txt
)
