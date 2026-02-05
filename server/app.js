

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { securityMiddleware } from './middleware/security.middleware.js';
import { rateLimiterMiddleware } from './middleware/rateLimiter.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware.js';
import routes from './routes/index.js';
import { logger, morganStream } from './utils/logger.js';


const app = express();




app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));


app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, 
}));


app.use(securityMiddleware);


app.use(rateLimiterMiddleware);




app.use(express.json({ limit: '10mb' }));


app.use(express.urlencoded({ extended: true, limit: '10mb' }));




if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: morganStream }));
}


app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});




app.use('/api', routes);


app.get('/', (req, res) => {
  res.json({
    name: 'VoiceDesk API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/health',
    timestamp: new Date().toISOString(),
  });
});






app.use(notFoundHandler);


app.use(errorHandler);

export default app;