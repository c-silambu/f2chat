import express from 'express';
import { getDBStatus } from '../config/db.js';
import { isRedisOnline } from '../config/redis.js';

export const createStatsRouter = (matchmaker) => {
  const router = express.Router();

  router.get('/health', async (req, res) => {
    const liveStats = matchmaker ? await matchmaker.getStats() : { waitingUsers: 0, activeConnections: 0 };
    
    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: getDBStatus() ? 'connected' : 'in-memory-fallback',
        redis: isRedisOnline() ? 'connected' : 'in-memory-fallback'
      },
      telemetry: liveStats
    });
  });

  return router;
};
