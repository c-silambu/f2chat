import { ModerationService } from '../services/moderationService.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export const registerChatHandlers = (io, socket, matchmaker) => {
  // Send 1-to-1 Text message
  socket.on('send_message', async (data = {}) => {
    try {
      const sessionId = socket.sessionId;
      const { roomId, text } = data;

      if (!sessionId || !roomId || !text) return;

      // 1. Validate and moderate text
      const modResult = ModerationService.checkMessage(sessionId, text, roomId);
      if (!modResult.safe) {
        socket.emit('message_blocked', {
          reason: modResult.error,
          text
        });
        return;
      }

      const messagePayload = {
        id: uuidv4(),
        senderId: sessionId,
        text: modResult.sanitizedText,
        timestamp: Date.now(),
        roomId
      };

      // 2. Broadcast to room (both sender and partner)
      io.to(roomId).emit('receive_message', messagePayload);
      logger.debug(`Relayed message in room ${roomId}`);
    } catch (err) {
      logger.error('Error in send_message:', err);
      socket.emit('error', { success: false, message: 'Could not deliver message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data = {}) => {
    try {
      const { roomId, isTyping } = data;
      if (!roomId) return;
      socket.to(roomId).emit('partner_typing', { isTyping: !!isTyping });
    } catch (err) {
      logger.error('Error forwarding typing indicator:', err);
    }
  });
};
