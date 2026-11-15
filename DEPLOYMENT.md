# 🚀 BrandGuard AI - Cloud Deployment Guide

This guide explains how to deploy **BrandGuard AI** to the cloud so anyone (including judges and team members) can access the live application via a public URL.

---

## ⚡ Option 1: Render (Recommended - Free & 1-Click)

Render natively supports our multi-runtime container (`Dockerfile`) or the provided `render.yaml` Blueprint.

### Method A: Deploy with Render Blueprint (Fastest)

1. Sign in or create a free account at [render.com](https://render.com).
2. Go to your **Render Dashboard** and click **New +** → **Blueprint**.
3. Connect your GitHub account and select repository: **`mrdhruv027/Brandguard-ai`**.
4. Render will read `render.yaml` and configure the web service automatically.
5. In the Environment Variables prompt:
   - `GEMINI_API_KEY`: *(Optional)* Paste your Google Gemini API key if you want live LLM generation, or leave blank to use the built-in deterministic rule engine.
   - `MONGODB_URI`: *(Optional)* Paste your MongoDB Atlas URI, or leave blank to use the zero-config resilient in-memory database store.
6. Click **Apply**.
7. Wait 2–3 minutes for the Docker container to build and start.
8. Your service will be live at `https://brandguard-ai.onrender.com` (or similar Render domain)!

---

### Method B: Deploy as a Standard Render Web Service

1. On [render.com](https://render.com), click **New +** → **Web Service**.
2. Select your repository: `mrdhruv027/Brandguard-ai`.
3. Configure the following settings:
   - **Name**: `brandguard-ai`
   - **Region**: Closest to you (e.g., Singapore or Frankfurt)
   - **Branch**: `main`
   - **Runtime**: **Docker**
   - **Instance Type**: **Free**
4. Under **Advanced / Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `AI_PORT` = `8000`
   - `AI_SERVICE_URL` = `http://127.0.0.1:8000`
   - `JWT_SECRET` = `any-random-secure-string-here`
   - *(Optional)* `GEMINI_API_KEY` = your Gemini key
   - *(Optional)* `MONGODB_URI` = your MongoDB Atlas connection string
5. Click **Create Web Service**.

---

## 🚂 Option 2: Railway (Alternative)

1. Sign in at [railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select `mrdhruv027/Brandguard-ai`.
4. Railway will automatically detect the root `Dockerfile`.
5. Under service **Settings** → **Networking**, click **Generate Domain** to get a public `*.up.railway.app` URL.
6. Under **Variables**, add any optional keys (`GEMINI_API_KEY`, `MONGODB_URI`).
7. Done!

---

## 🐳 Option 3: Local or VPS Docker Run

If running on a VPS (DigitalOcean, AWS EC2, or local Docker Desktop):

```bash
# 1. Clone repository
git clone https://github.com/mrdhruv027/Brandguard-ai.git
cd Brandguard-ai

# 2. Build the Docker image
docker build -t brandguard-ai .

# 3. Run the container
docker run -d -p 5000:5000 \
  -e PORT=5000 \
  -e GEMINI_API_KEY="your-api-key-if-any" \
  --name brandguard brandguard-ai

# 4. Open in browser
# http://localhost:5000
```

---

## 🔍 Health Check & Verification

Once deployed, you can verify your service status:
- Web App UI: `https://<your-domain>/`
- API Health Status: `https://<your-domain>/api/health`

```json
{
  "status": "healthy",
  "app": "BrandGuard AI",
  "database": "connected (or memory-fallback)",
  "ai_service": "online",
  "mode": "gemini-1.5-flash / deterministic-rule-engine",
  "version": "1.0.0"
}
```
