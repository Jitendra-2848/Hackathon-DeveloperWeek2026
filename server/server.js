

import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { initializeSocket } from './sockets/index.js';
import { logger } from './utils/logger.js';


dotenv.config();


const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';


const server = http.createServer(app);


const io = initializeSocket(server);


app.set('io', io);


server.listen(PORT, () => {
  logger.info(' VoiceDesk Server Started Successfully!');
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Server running on: http://localhost:${PORT}`);
  logger.info(`WebSocket ready for connections`);
  logger.info(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});


const gracefulShutdown = (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    io.close(() => {
      logger.info('Socket.io server closed');
      process.exit(0);
    });
  });

  
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};


process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));


process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});


process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export { server, io };