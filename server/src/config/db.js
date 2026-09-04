import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export const connectDB = async () => {
  if (!config.mongoUri) {
    logger.warn('No MONGODB_URI provided. Running with in-memory storage for database models.');
    return false;
  }

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true
    });
    isConnected = true;
    logger.info('MongoDB connected successfully to: ' + config.mongoUri.replace(/:([^:@]{1,8})@/, ':****@'));
    return true;
  } catch (error) {
    logger.warn(`MongoDB connection failed (${error.message}). Falling back to in-memory mode for development resilience.`);
    isConnected = false;
    return false;
  }
};

export const getDBStatus = () => isConnected;
