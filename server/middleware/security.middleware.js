

import { logger } from '../utils/logger.js';


export const securityMiddleware = (req, res, next) => {
  
  res.removeHeader('X-Powered-By');

  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'microphone=(self), camera=()');

  
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  
  const suspiciousPatterns = [
    /(\.\.|\/\/)/,  
    /<script>/i,     
    /union.*select/i, 
    /javascript:/i,  
  ];

  const fullUrl = req.originalUrl || req.url;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl) || pattern.test(JSON.stringify(req.body))) {
      logger.warn('Suspicious request detected', {
        ip: req.ip,
        method: req.method,
        url: fullUrl,
        userAgent: req.get('user-agent'),
      });
      break;
    }
  }

  next();
};


export const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('content-type');
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type header is required',
      });
    }

    const allowedTypes = ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded'];
    const isAllowed = allowedTypes.some(type => contentType.includes(type));

    if (!isAllowed) {
      return res.status(415).json({
        success: false,
        message: 'Unsupported Content-Type',
      });
    }
  }

  next();
};

export default securityMiddleware;