

import { SOCKET_EVENTS } from '../utils/constants.js';
import { setupVoiceSocket } from './voiceSocket.js';
import { logger } from '../utils/logger.js';


export const setupSocketHandlers = (io) => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logger.info('Client connected', {
      socketId: socket.id,
      transport: socket.conn.transport.name,
    });

    
    setupVoiceSocket(io, socket);

    
    socket.on('ping', (callback) => {
      if (typeof callback === 'function') {
        callback();
      }
    });

    
    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logger.info('Client disconnected', {
        socketId: socket.id,
        reason,
      });
    });

    
    socket.on('error', (error) => {
      logger.error('Socket error', {
        socketId: socket.id,
        error: error.message,
      });
    });

    
    socket.emit('welcome', {
      message: 'Connected to VoiceDesk server',
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });
};

export default setupSocketHandlers;