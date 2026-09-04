import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const QUEUE_KEY = 'match:queue';
const USER_KEY_PREFIX = 'match:user:';
const ROOM_KEY_PREFIX = 'match:room:';
const BLOCK_KEY_PREFIX = 'match:blocks:';

export class MatchmakerService {
  constructor(io) {
    this.io = io;
  }

  get redis() {
    return getRedisClient();
  }

  // Register or update user socket
  async registerUser(sessionId, socketId) {
    const redis = this.redis;
    const userData = {
      sessionId,
      socketId,
      status: 'idle',
      roomId: '',
      joinedAt: Date.now().toString()
    };
    await redis.set(`${USER_KEY_PREFIX}${sessionId}`, JSON.stringify(userData), 'EX', 86400);
    // Also map socketId to sessionId
    await redis.set(`socket:${socketId}`, sessionId, 'EX', 86400);
  }

  async getSessionBySocketId(socketId) {
    return await this.redis.get(`socket:${socketId}`);
  }

  async getUser(sessionId) {
    const raw = await this.redis.get(`${USER_KEY_PREFIX}${sessionId}`);
    return raw ? JSON.parse(raw) : null;
  }

  async updateUser(sessionId, updates) {
    const user = await this.getUser(sessionId);
    if (!user) return null;
    const updated = { ...user, ...updates };
    await this.redis.set(`${USER_KEY_PREFIX}${sessionId}`, JSON.stringify(updated), 'EX', 86400);
    return updated;
  }

  // Block management in Redis for ultra-fast lookup
  async blockUser(blockerSessionId, blockedSessionId) {
    const redis = this.redis;
    await redis.sadd(`${BLOCK_KEY_PREFIX}${blockerSessionId}`, blockedSessionId);
  }

  async isBlocked(userA, userB) {
    const redis = this.redis;
    const [blockedByA, blockedByB] = await Promise.all([
      redis.sismember(`${BLOCK_KEY_PREFIX}${userA}`, userB),
      redis.sismember(`${BLOCK_KEY_PREFIX}${userB}`, userA)
    ]);
    return blockedByA === 1 || blockedByB === 1;
  }

  // Add user to matchmaking queue
  async enqueue(sessionId, socketId) {
    const redis = this.redis;

    // Ensure previous room is cleaned up
    await this.leaveRoom(sessionId, 'skip');

    // Update user state
    await this.updateUser(sessionId, {
      status: 'searching',
      socketId,
      roomId: ''
    });

    // Remove from queue first to prevent duplicates
    await redis.lrem(QUEUE_KEY, 0, sessionId);

    // Try finding an available match from the queue
    let partnerSessionId = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      attempts++;
      const candidateId = await redis.rpop(QUEUE_KEY);
      if (!candidateId) break;

      // Cannot match with self
      if (candidateId === sessionId) {
        continue;
      }

      // Check candidate status and connection
      const candidate = await this.getUser(candidateId);
      if (!candidate || candidate.status !== 'searching') {
        // Stale or disconnected candidate
        continue;
      }

      // Check mutual blocks
      const blocked = await this.isBlocked(sessionId, candidateId);
      if (blocked) {
        // Put candidate back to front of queue and continue looking
        await redis.lpush(QUEUE_KEY, candidateId);
        continue;
      }

      // Check if candidate socket is still connected
      const candidateSocket = this.io.sockets.sockets.get(candidate.socketId);
      if (!candidateSocket || !candidateSocket.connected) {
        // Disconnected
        await this.cleanupUser(candidateId);
        continue;
      }

      partnerSessionId = candidateId;
      break;
    }

    if (partnerSessionId) {
      // Pair users into a new room
      await this.createMatch(sessionId, partnerSessionId);
    } else {
      // No immediate match, push to queue
      await redis.lpush(QUEUE_KEY, sessionId);
      this.io.to(socketId).emit('searching', {
        message: 'Searching for a chat partner...',
        queuePosition: await redis.llen(QUEUE_KEY)
      });
    }
  }

  // Cancel queue search
  async dequeue(sessionId) {
    const redis = this.redis;
    await redis.lrem(QUEUE_KEY, 0, sessionId);
    await this.updateUser(sessionId, { status: 'idle' });
  }

  // Pair two users in a room
  async createMatch(sessionA, sessionB) {
    const roomId = `room_${uuidv4()}`;
    const redis = this.redis;

    const userA = await this.getUser(sessionA);
    const userB = await this.getUser(sessionB);

    if (!userA || !userB) {
      logger.warn(`Failed to create match, missing user data: ${sessionA}, ${sessionB}`);
      return;
    }

    const roomData = {
      roomId,
      peerA: sessionA,
      peerB: sessionB,
      peerASocketId: userA.socketId,
      peerBSocketId: userB.socketId,
      createdAt: Date.now()
    };

    await redis.set(`${ROOM_KEY_PREFIX}${roomId}`, JSON.stringify(roomData), 'EX', 7200);

    await this.updateUser(sessionA, { status: 'in_chat', roomId });
    await this.updateUser(sessionB, { status: 'in_chat', roomId });

    // Cluster-safe room joining
    this.io.in(userA.socketId).socketsJoin(roomId);
    this.io.in(userB.socketId).socketsJoin(roomId);

    // Emit match_found to both peers
    this.io.to(userA.socketId).emit('match_found', {
      roomId,
      partnerId: sessionB,
      isInitiator: true // User A initiates WebRTC Offer
    });

    this.io.to(userB.socketId).emit('match_found', {
      roomId,
      partnerId: sessionA,
      isInitiator: false // User B waits for WebRTC Offer
    });

    logger.info(`Match established in room ${roomId} between ${sessionA} and ${sessionB}`);
  }

  // Leave active room
  async leaveRoom(sessionId, reason = 'left') {
    const redis = this.redis;
    const user = await this.getUser(sessionId);
    if (!user || !user.roomId) return null;

    const roomId = user.roomId;
    const rawRoom = await redis.get(`${ROOM_KEY_PREFIX}${roomId}`);
    
    // Clear user's room reference
    await this.updateUser(sessionId, { status: 'idle', roomId: '' });

    if (!rawRoom) return null;

    const room = JSON.parse(rawRoom);
    await redis.del(`${ROOM_KEY_PREFIX}${roomId}`);

    const partnerSessionId = room.peerA === sessionId ? room.peerB : room.peerA;
    const partner = await this.getUser(partnerSessionId);

    if (partner) {
      await this.updateUser(partnerSessionId, { status: 'idle', roomId: '' });
      this.io.in(partner.socketId).socketsLeave(roomId);
      this.io.to(partner.socketId).emit('partner_disconnected', {
        roomId,
        reason,
        message: 'Your partner has disconnected or skipped.'
      });
    }

    if (user.socketId) {
      this.io.in(user.socketId).socketsLeave(roomId);
    }

    return { roomId, partnerSessionId };
  }

  // Complete cleanup on disconnect
  async cleanupUser(sessionId, socketId) {
    const redis = this.redis;
    await redis.lrem(QUEUE_KEY, 0, sessionId);
    await this.leaveRoom(sessionId, 'disconnected');
    if (socketId) {
      await redis.del(`socket:${socketId}`);
    }
    await this.updateUser(sessionId, { status: 'idle' });
  }

  // Metrics for Admin Dashboard
  async getStats() {
    const redis = this.redis;
    const queueSize = await redis.llen(QUEUE_KEY);
    return {
      waitingUsers: queueSize,
      activeConnections: this.io.engine.clientsCount || 0
    };
  }
}
