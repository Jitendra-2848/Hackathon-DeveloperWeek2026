import { io } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '../utils/constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Connect to server
  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupDefaultListeners();
    
    return this.socket;
  }

  // Setup default event listeners
  setupDefaultListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Emit event
  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }
    this.socket.emit(event, data);
  }

  // Emit with acknowledgment
  emitWithAck(event, data) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(event, data, (response) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Subscribe to event
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }
    this.socket.on(event, callback);
    
    // Track listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Unsubscribe from event
  off(event, callback) {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // Check connection status
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id || null;
  }
}

export const socketService = new SocketService();
export default socketService;