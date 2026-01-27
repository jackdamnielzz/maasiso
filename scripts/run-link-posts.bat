@echo off
REM ═══════════════════════════════════════════════════════════════════════════════
REM  MAASISO - Gerelateerde Blog Posts Linken
REM  Dubbelklik op dit bestand om het script te starten
REM ═══════════════════════════════════════════════════════════════════════════════

title MaasISO - Gerelateerde Posts Linken

REM Ga naar de Strapi folder
cd /d "D:\Programmeren\MaasISO\New without errors\maasiso-strapi-railway"

REM Check of node beschikbaar is
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ERROR: Node.js is niet gevonden!
    echo  Installeer Node.js van https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Run het script
node scripts/link-gerelateerde-posts.js

REM Als het script crasht, toon de foutmelding
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  Er is een fout opgetreden. Druk op een toets om af te sluiten...
    pause >nul
)
