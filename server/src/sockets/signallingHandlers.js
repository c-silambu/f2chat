import { logger } from '../utils/logger.js';

export const registerSignallingHandlers = (io, socket, matchmaker) => {
  // WebRTC Peer Ready Handshake
  socket.on('peer_ready', async (data = {}) => {
    try {
      const { roomId } = data;
      const sessionId = socket.sessionId;
      if (!roomId) return;

      // Broadcast peer readiness to partner in room
      socket.to(roomId).emit('peer_ready', {
        senderId: sessionId,
        roomId
      });
      logger.debug(`Relayed peer_ready for room ${roomId} from ${sessionId}`);
    } catch (err) {
      logger.error('Error forwarding peer_ready:', err);
    }
  });

  // WebRTC SDP Offer
  socket.on('offer', async (data = {}) => {
    try {
      const { roomId, sdp } = data;
      const sessionId = socket.sessionId;
      if (!roomId || !sdp) return;

      // Broadcast offer to partner in the room (excluding sender)
      socket.to(roomId).emit('offer', {
        sdp,
        senderId: sessionId,
        roomId
      });
      logger.debug(`Relayed WebRTC offer for room ${roomId} from ${sessionId}`);
    } catch (err) {
      logger.error('Error forwarding offer:', err);
    }
  });

  // WebRTC SDP Answer
  socket.on('answer', async (data = {}) => {
    try {
      const { roomId, sdp } = data;
      const sessionId = socket.sessionId;
      if (!roomId || !sdp) return;

      // Broadcast answer to partner in the room
      socket.to(roomId).emit('answer', {
        sdp,
        senderId: sessionId,
        roomId
      });
      logger.debug(`Relayed WebRTC answer for room ${roomId} from ${sessionId}`);
    } catch (err) {
      logger.error('Error forwarding answer:', err);
    }
  });

  // WebRTC ICE Candidate
  socket.on('ice_candidate', async (data = {}) => {
    try {
      const { roomId, candidate } = data;
      const sessionId = socket.sessionId;
      if (!roomId || !candidate) return;

      socket.to(roomId).emit('ice_candidate', {
        candidate,
        senderId: sessionId,
        roomId
      });
    } catch (err) {
      logger.error('Error forwarding ice_candidate:', err);
    }
  });
};
