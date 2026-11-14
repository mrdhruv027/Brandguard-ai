@echo off
title BrandGuard AI - Complete System Launcher
echo ==============================================================
echo   🛡️ BRANDGUARD AI - Intelligent Brand Governance Platform
echo   CodeNova India 2026 - Round 2
echo ==============================================================
echo.
echo [1/2] Launching Python FastAPI RAG Service on port 8000...
start "BrandGuard Python AI Service" cmd /k "cd /d %~dp0ai_service && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching Node.js Backend & Web UI on port 5000...
start "BrandGuard Node.js Web Server" cmd /k "cd /d %~dp0server && node src/index.js"

echo.
echo Application will be live at:
echo 👉 Web Interface: http://localhost:5000
echo 👉 Backend API:   http://localhost:5000/api
echo 👉 AI Service:    http://localhost:8000/docs
echo.
echo Press any key to open the browser...
pause >nul
start http://localhost:5000
