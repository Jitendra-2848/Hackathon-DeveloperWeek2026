

import { AppError } from './errorHandler.middleware.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { logger } from '../utils/logger.js';


export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return next(new AppError('API key is required', HTTP_STATUS.UNAUTHORIZED));
  }

  
  
  const validApiKeys = (process.env.VALID_API_KEYS || '').split(',');
  
  if (validApiKeys.length > 0 && validApiKeys[0] !== '' && !validApiKeys.includes(apiKey)) {
    logger.warn('Invalid API key attempt', {
      ip: req.ip,
      path: req.path,
    });
    return next(new AppError('Invalid API key', HTTP_STATUS.UNAUTHORIZED));
  }

  next();
};


export const optionalApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (apiKey) {
    req.hasApiKey = true;
    
  }

  next();
};


export const validateSocketConnection = (socket, next) => {
  const { origin } = socket.handshake.headers;
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(url => url.trim());

  
  if (origin && !allowedOrigins.includes(origin)) {
    logger.warn('Socket connection rejected - invalid origin', {
      origin,
      socketId: socket.id,
    });
    return next(new Error('Invalid origin'));
  }

  
  

  logger.debug('Socket connection authorized', {
    socketId: socket.id,
    origin,
  });

  next();
};

export default {
  validateApiKey,
  optionalApiKey,
  validateSocketConnection,
};