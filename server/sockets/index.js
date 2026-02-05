

import { Server } from 'socket.io';
import socketConfig from '../config/socket.config.js';
import { setupSocketHandlers } from './socketHandler.js';
import { validateSocketConnection } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';


export const initializeSocket = (server) => {
  const io = new Server(server, socketConfig);

  
  io.use((socket, next) => {
    validateSocketConnection(socket, next);
  });

  
  setupSocketHandlers(io);

  logger.info('Socket.io server initialized');

  return io;
};

export default initializeSocket;