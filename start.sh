#!/bin/sh
set -e

echo "=========================================================="
echo "  🛡️ BRANDGUARD AI - Cloud Production Container Entrypoint"
echo "=========================================================="

export AI_PORT=${AI_PORT:-8000}
export AI_SERVICE_URL="http://127.0.0.1:${AI_PORT}"
export PORT=${PORT:-5000}

# 1. Start Python FastAPI Intelligence Engine in background
echo "--> Starting Python FastAPI AI Service on port ${AI_PORT}..."
cd /app/ai_service
python3 -m uvicorn main:app --host 127.0.0.1 --port ${AI_PORT} &
AI_PID=$!

# Wait briefly for AI service to initialize
sleep 2

# 2. Start Node.js Express Web Server on main public port
echo "--> Starting Node.js Orchestrator & Client UI on port ${PORT}..."
cd /app/server
exec node src/index.js
