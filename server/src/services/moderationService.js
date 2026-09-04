import { ModerationEvent } from '../models/ModerationEvent.js';
import { logger } from '../utils/logger.js';

// Common prohibited patterns & spam words
const BLOCKED_WORDS = [
  'childporn', 'cp', 'rape', 'pedophile', 'pedo', 'hitler', 'nazi',
  'kill yourself', 'kys', 'terrorist', 'bomb threat'
];

const SUSPICIOUS_PATTERNS = [
  /(?:https?:\/\/|www\.)[^\s]+/gi, // URLs / external links
  /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, // Phone numbers
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
  /(telegram|t\.me|snapchat|whatsapp|discord\.gg|instagram\.com\/)/gi, // Social media handles
  /(.)\1{6,}/g // Excessive character repetitions like aaaaaaa
];

// In-memory rate limiting map for socket messages: sessionId -> { count, lastReset }
const messageRateMap = new Map();

export class ModerationService {
  /**
   * Check and sanitize incoming text chat messages
   * @param {string} sessionId 
   * @param {string} text 
   * @param {string} roomId 
   * @returns {{ safe: boolean, error?: string, sanitizedText?: string }}
   */
  static checkMessage(sessionId, text, roomId = null) {
    if (!text || typeof text !== 'string') {
      return { safe: false, error: 'Empty message' };
    }

    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return { safe: false, error: 'Empty message' };
    }

    if (trimmed.length > 500) {
      return { safe: false, error: 'Message exceeds maximum limit of 500 characters' };
    }

    // 1. Rate Limiting Check (Max 6 messages per 3 seconds)
    const now = Date.now();
    const rate = messageRateMap.get(sessionId) || { count: 0, lastReset: now };

    if (now - rate.lastReset > 3000) {
      rate.count = 1;
      rate.lastReset = now;
    } else {
      rate.count++;
      if (rate.count > 6) {
        this.logEvent(sessionId, roomId, 'rate_limit', 'warn', 'Rate limit exceeded (too fast)');
        return { safe: false, error: 'You are sending messages too fast. Please slow down.' };
      }
    }
    messageRateMap.set(sessionId, rate);

    const lower = trimmed.toLowerCase();

    // 2. Severe Safety Filter
    for (const badWord of BLOCKED_WORDS) {
      if (lower.includes(badWord)) {
        this.logEvent(sessionId, roomId, 'text_filter', 'block_message', `Blocked keyword: ${badWord}`);
        return { safe: false, error: 'Your message violates community guidelines and was blocked.' };
      }
    }

    // 3. Spam & URL Pattern Filter
    let sanitized = trimmed;
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '[Link/Contact Info Hidden]');
      }
    }

    return { safe: true, sanitizedText: sanitized };
  }

  static async logEvent(sessionId, roomId, type, action, details) {
    try {
      await ModerationEvent.create({
        sessionId,
        roomId,
        type,
        action,
        details,
        confidence: 1.0
      });
    } catch (err) {
      logger.debug('Database unavailable for ModerationEvent logging; recorded in console.', { sessionId, type, details });
    }
  }
}
