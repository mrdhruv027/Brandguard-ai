const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, getDBStatus } = require('./config/db');
const Store = require('./models/store');

const authRoutes = require('./routes/authRoutes');
const guidelineRoutes = require('./routes/guidelineRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io for real-time collaboration events
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Register Socket.io with store for live event streaming
Store.setSocketBroadcaster(io);

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Database connection
connectDB().then(() => {
  Store.seedDatabaseIfEmpty();
});

// API Health / Status endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  return res.json({
    status: 'online',
    service: 'BrandGuard AI Orchestrator API',
    database: dbStatus.isConnected ? 'MongoDB Connected' : 'Resilient In-Memory Store Active',
    dbDetails: dbStatus,
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', guidelineRoutes);
app.use('/api', submissionRoutes);
app.use('/api', reviewRoutes);
app.use('/api', auditRoutes);

// 404 handler for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Static frontend serving with SPA fallback
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[BrandGuard Server] Serving static client build from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>BrandGuard AI</title></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center; color: #0F172A;">
          <h2>🛡️ BrandGuard AI API Server is Online</h2>
          <p>Client build not found in <code>client/dist</code>. Run <code>npm run build</code> in <code>client/</code> to compile the frontend, or launch Vite on port 3000.</p>
          <p><a href="/api/health">Check API Health Endpoint</a></p>
        </body>
      </html>
    `);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[BrandGuard Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🛡️ BRANDGUARD AI - Backend Orchestrator`);
  console.log(`  🚀 Server running on http://localhost:${PORT}`);
  console.log(`  ⚡ Socket.io enabled for real-time events`);
  console.log(`====================================================`);
});

module.exports = { app, server };
