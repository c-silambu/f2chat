import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server dir or root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vibepulse',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'vibepulse_jwt_default_secret_key_prod_32chars',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  
  // WebRTC defaults
  iceServers: [
    { urls: process.env.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302' },
    ...(process.env.VITE_TURN_SERVER ? [{
      urls: process.env.VITE_TURN_SERVER,
      username: process.env.VITE_TURN_USERNAME || '',
      credential: process.env.VITE_TURN_CREDENTIAL || ''
    }] : [])
  ]
};
