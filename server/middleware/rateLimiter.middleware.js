

import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants.js';


export const rateLimiterMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, 
  message: {
    success: false,
    message: ERROR_MESSAGES.RATE_LIMIT,
    retryAfter: '15 minutes',
  },
  standardHeaders: true, 
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(options.statusCode).json(options.message);
  },
  skip: (req) => {
    
    return req.path === '/api/health';
  },
});


export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10, 
  message: {
    success: false,
    message: 'Too many requests to this endpoint',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const voiceRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 30, 
  message: {
    success: false,
    message: 'Voice request limit exceeded',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiterMiddleware;