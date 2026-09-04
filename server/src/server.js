import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { createAdapter } from '@socket.io/redis-adapter';

import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { initRedis } from './config/redis.js';
import { setupSockets } from './sockets/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { createStatsRouter } from './routes/statsRoutes.js';

const app = express();
const server = http.createServer(app);

// 1. Security & Logging Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible client connections
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// 2. Setup Socket.IO Server
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Permissive for signalling development & multi-device testing
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  transports: ['websocket', 'polling']
});

// Start Server Routine
const startServer = async () => {
  logger.info('Initializing VibePulse Server Core...');

  // Initialize DB
  await connectDB();

  // Initialize Redis
  const { pub, sub, isMock } = await initRedis();
  if (!isMock && sub) {
    io.adapter(createAdapter(pub, sub));
    logger.info('Socket.IO configured with Redis Adapter for multi-instance horizontal scaling.');
  } else {
    logger.info('Socket.IO running with resilient built-in Matchmaking Queue.');
  }

  // Setup Sockets and Matchmaker
  const matchmaker = setupSockets(io);

  // Mount API Endpoints
  app.use('/api/admin', adminRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api', createStatsRouter(matchmaker));

  // Health check root
  app.get('/', (req, res) => {
    res.json({
      name: 'VibePulse Signalling & Matchmaking API',
      version: '1.0.0',
      status: 'online',
      docs: '/api/health'
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  const PORT = config.port;
  server.listen(PORT, () => {
    logger.info(`=======================================================`);
    logger.info(`  VibePulse Server listening on port: ${PORT}`);
    logger.info(`  Client URL: ${config.clientUrl}`);
    logger.info(`  Environment: ${config.nodeEnv}`);
    logger.info(`=======================================================`);
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

// Graceful Shutdown
const shutdown = () => {
  logger.info('Gracefully shutting down VibePulse server...');
  io.close(() => {
    server.close(() => {
      logger.info('Server closed. Goodbye!');
      process.exit(0);
    });
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
