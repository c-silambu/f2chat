import Redis from 'ioredis';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let redisClient = null;
let redisSubClient = null;
let isRedisAvailable = false;

// In-memory Redis Mock storage for local development without Docker
class InMemoryRedis {
  constructor() {
    this.store = new Map();
    this.sets = new Map();
    this.lists = new Map();
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async set(key, val, mode, ttl) {
    this.store.set(key, val);
    if (mode === 'EX' && ttl) {
      setTimeout(() => this.store.delete(key), ttl * 1000);
    }
    return 'OK';
  }

  async del(key) {
    const deleted = this.store.delete(key) || this.sets.delete(key) || this.lists.delete(key);
    return deleted ? 1 : 0;
  }

  async sadd(key, ...members) {
    if (!this.sets.has(key)) this.sets.set(key, new Set());
    const set = this.sets.get(key);
    let added = 0;
    for (const m of members) {
      if (!set.has(m)) {
        set.add(m);
        added++;
      }
    }
    return added;
  }

  async srem(key, ...members) {
    if (!this.sets.has(key)) return 0;
    const set = this.sets.get(key);
    let removed = 0;
    for (const m of members) {
      if (set.delete(m)) removed++;
    }
    return removed;
  }

  async sismember(key, member) {
    if (!this.sets.has(key)) return 0;
    return this.sets.get(key).has(member) ? 1 : 0;
  }

  async smembers(key) {
    if (!this.sets.has(key)) return [];
    return Array.from(this.sets.get(key));
  }

  async scard(key) {
    if (!this.sets.has(key)) return 0;
    return this.sets.get(key).size;
  }

  async lpush(key, ...values) {
    if (!this.lists.has(key)) this.lists.set(key, []);
    const list = this.lists.get(key);
    list.unshift(...values);
    return list.length;
  }

  async rpop(key) {
    if (!this.lists.has(key)) return null;
    const list = this.lists.get(key);
    return list.pop() || null;
  }

  async lrem(key, count, value) {
    if (!this.lists.has(key)) return 0;
    const list = this.lists.get(key);
    const initialLen = list.length;
    const filtered = list.filter(item => item !== value);
    this.lists.set(key, filtered);
    return initialLen - filtered.length;
  }

  async llen(key) {
    if (!this.lists.has(key)) return 0;
    return this.lists.get(key).length;
  }

  async lrange(key, start, stop) {
    if (!this.lists.has(key)) return [];
    const list = this.lists.get(key);
    const end = stop === -1 ? list.length : stop + 1;
    return list.slice(start, end);
  }
}

const memoryRedis = new InMemoryRedis();

export const initRedis = async () => {
  if (!config.redisUrl) {
    logger.warn('No REDIS_URL configured. Using InMemoryRedis.');
    return { pub: memoryRedis, sub: null, isMock: true };
  }

  try {
    const client = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 2) return null; // Don't hang indefinitely in dev
        return 500;
      },
      connectTimeout: 2000,
      lazyConnect: true
    });

    await client.connect();
    logger.info('Connected to Redis at: ' + config.redisUrl);
    isRedisAvailable = true;
    redisClient = client;

    // Duplicate client for pub/sub if needed by socket.io adapter
    redisSubClient = client.duplicate();
    await redisSubClient.connect();

    return { pub: redisClient, sub: redisSubClient, isMock: false };
  } catch (err) {
    logger.warn(`Redis connection failed (${err.message}). Defaulting to InMemory Redis Matchmaker for maximum resilience.`);
    isRedisAvailable = false;
    return { pub: memoryRedis, sub: null, isMock: true };
  }
};

export const getRedisClient = () => {
  if (isRedisAvailable && redisClient) {
    return redisClient;
  }
  return memoryRedis;
};

export const isRedisOnline = () => isRedisAvailable;
