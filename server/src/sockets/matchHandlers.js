import { logger } from '../utils/logger.js';
import { Report } from '../models/Report.js';
import { Block } from '../models/Block.js';
import { User } from '../models/User.js';

export const registerMatchHandlers = (io, socket, matchmaker) => {
  // User enters matchmaking queue
  socket.on('join_queue', async (data = {}) => {
    try {
      const sessionId = socket.sessionId;
      if (!sessionId) return;

      logger.info(`User ${sessionId} requested to join matchmaking queue`);
      await matchmaker.enqueue(sessionId, socket.id);
    } catch (err) {
      logger.error('Error in join_queue:', err);
      socket.emit('error', { success: false, message: 'Failed to join queue', code: 'QUEUE_ERROR' });
    }
  });

  // User cancels waiting in queue
  socket.on('cancel_queue', async () => {
    try {
      const sessionId = socket.sessionId;
      if (!sessionId) return;

      logger.info(`User ${sessionId} cancelled matchmaking queue`);
      await matchmaker.dequeue(sessionId);
      socket.emit('queue_cancelled', { success: true });
    } catch (err) {
      logger.error('Error in cancel_queue:', err);
    }
  });

  // Next / Skip partner
  socket.on('next_user', async () => {
    try {
      const sessionId = socket.sessionId;
      if (!sessionId) return;

      logger.info(`User ${sessionId} skipped to next partner`);
      // Leave current room, then re-enqueue
      await matchmaker.leaveRoom(sessionId, 'skipped');
      await matchmaker.enqueue(sessionId, socket.id);
    } catch (err) {
      logger.error('Error in next_user:', err);
      socket.emit('error', { success: false, message: 'Failed to skip partner', code: 'SKIP_ERROR' });
    }
  });

  // Disconnect from active chat without rejoining queue
  socket.on('disconnect_chat', async () => {
    try {
      const sessionId = socket.sessionId;
      if (!sessionId) return;

      logger.info(`User ${sessionId} stopped video chat`);
      await matchmaker.leaveRoom(sessionId, 'ended');
      socket.emit('chat_ended', { success: true });
    } catch (err) {
      logger.error('Error in disconnect_chat:', err);
    }
  });

  // Report user
  socket.on('report_user', async (data = {}) => {
    try {
      const sessionId = socket.sessionId;
      const { reportedSessionId, reason, details, roomId } = data;

      if (!sessionId || !reportedSessionId || !reason) {
        socket.emit('error', { success: false, message: 'Invalid report payload' });
        return;
      }

      // Persist report in MongoDB (if connected)
      try {
        await Report.create({
          reporterSessionId: sessionId,
          reportedSessionId,
          roomId,
          reason,
          details: details ? details.substring(0, 500) : ''
        });

        // Increment report count on user
        await User.findOneAndUpdate(
          { sessionId: reportedSessionId },
          { $inc: { totalReportsReceived: 1 } }
        );
      } catch (dbErr) {
        logger.debug('Report saved in fallback mode (db not connected)');
      }

      // Automatically block reported user in Redis
      await matchmaker.blockUser(sessionId, reportedSessionId);

      // Disconnect current room and skip
      await matchmaker.leaveRoom(sessionId, 'reported');
      
      socket.emit('report_success', {
        success: true,
        message: 'Report submitted. The user has been blocked and you have been safely disconnected.'
      });

      // Put reporter back in queue if requested
      if (data.autoNext) {
        await matchmaker.enqueue(sessionId, socket.id);
      }
    } catch (err) {
      logger.error('Error submitting report:', err);
      socket.emit('error', { success: false, message: 'Failed to process report' });
    }
  });

  // Block user
  socket.on('block_user', async (data = {}) => {
    try {
      const sessionId = socket.sessionId;
      const { blockedSessionId } = data;

      if (!sessionId || !blockedSessionId) return;

      // Add to Redis set
      await matchmaker.blockUser(sessionId, blockedSessionId);

      // Save to Mongo
      try {
        await Block.create({
          blockerSessionId: sessionId,
          blockedSessionId,
          reason: data.reason || 'user_blocked'
        });
      } catch (dbErr) {
        logger.debug('Block persisted in Redis fallback');
      }

      // Leave active chat
      await matchmaker.leaveRoom(sessionId, 'blocked');

      socket.emit('blocked', {
        success: true,
        blockedSessionId,
        message: 'User blocked successfully.'
      });

      if (data.autoNext) {
        await matchmaker.enqueue(sessionId, socket.id);
      }
    } catch (err) {
      logger.error('Error blocking user:', err);
    }
  });
};
