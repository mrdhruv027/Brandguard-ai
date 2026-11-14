@echo off
title BrandGuard AI - Node Orchestrator & Web Server
echo Starting BrandGuard AI Node.js Backend & Web UI on port 5000...
cd /d "%~dp0server"
node src/index.js
pause
