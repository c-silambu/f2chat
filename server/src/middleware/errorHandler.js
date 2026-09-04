import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled Express Error: ${err.message}`, err.stack);

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR'
  };

  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
