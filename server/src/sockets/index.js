import { MatchmakerService } from '../services/matchmaker.js';
import { registerMatchHandlers } from './matchHandlers.js';
import { registerSignallingHandlers } from './signallingHandlers.js';
import { registerChatHandlers } from './chatHandlers.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.js';

export const setupSockets = (io) => {
  const matchmaker = new MatchmakerService(io);

  // Middleware: Authenticate & Identify Session
  io.use(async (socket, next) => {
    try {
      const sessionId = socket.handshake.auth?.sessionId || socket.handshake.query?.sessionId;
      if (!sessionId) {
        return next(new Error('Authentication failed: Missing sessionId'));
      }

      // Check if user is banned
      try {
        const user = await User.findOne({ sessionId });
        if (user && user.status === 'banned') {
          return next(new Error('Your account has been suspended for violating community rules.'));
        }
      } catch (err) {
        // Fallback if Mongo is down
      }

      socket.sessionId = sessionId;
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on('connection', async (socket) => {
    const sessionId = socket.sessionId;
    const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    logger.info(`Socket connected: ${socket.id} (Session: ${sessionId})`);

    // Register user in Redis / Matchmaker
    await matchmaker.registerUser(sessionId, socket.id);

    // Save or update user record in DB
    try {
      await User.findOneAndUpdate(
        { sessionId },
        {
          sessionId,
          ipAddress: clientIp,
          userAgent: socket.handshake.headers['user-agent'] || '',
          lastSeen: new Date(),
          status: 'active'
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      // Ignored if DB is offline
    }

    // Register modular event handlers
    registerMatchHandlers(io, socket, matchmaker);
    registerSignallingHandlers(io, socket, matchmaker);
    registerChatHandlers(io, socket, matchmaker);

    // Handle Client Disconnect
    socket.on('disconnect', async (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (Session: ${sessionId}) [Reason: ${reason}]`);
      await matchmaker.cleanupUser(sessionId, socket.id);

      try {
        await User.findOneAndUpdate(
          { sessionId },
          { lastSeen: new Date(), status: 'idle' }
        );
      } catch (err) {
        // Ignored
      }
    });
  });

  return matchmaker;
};
