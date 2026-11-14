@echo off
title BrandGuard AI - Python FastAPI Service
echo Starting BrandGuard AI Python Intelligence Engine on port 8000...
cd /d "%~dp0ai_service"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
