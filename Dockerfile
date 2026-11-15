# Multi-runtime Dockerfile for BrandGuard AI (Node.js + Python FastAPI)
FROM node:20-bookworm-slim

# Install system dependencies and Python 3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Set up Python virtual environment and install AI service dependencies
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY ai_service/requirements.txt ./ai_service/
RUN pip install --no-cache-dir -r ./ai_service/requirements.txt

# 2. Install Server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# 3. Install Client dependencies and build production SPA
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client/ ./client/
RUN cd client && npm run build

# 4. Copy backend and AI service source code
COPY ai_service/ ./ai_service/
COPY server/ ./server/

# 5. Copy startup entrypoint
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Environment defaults
ENV NODE_ENV=production
ENV PORT=5000
ENV AI_PORT=8000
ENV AI_SERVICE_URL="http://127.0.0.1:8000"

EXPOSE 5000

CMD ["./start.sh"]
