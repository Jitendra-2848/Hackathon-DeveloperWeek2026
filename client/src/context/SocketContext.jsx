import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { SOCKET_URL, SOCKET_EVENTS } from '../utils/constants';

// ===== Create Context =====
const SocketContext = createContext(null);

// ===== Socket Provider Component =====
export function SocketProvider({ children }) {
  // State
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  // Refs
  const listenersRef = useRef(new Map());

  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 Initializing socket connection to:', SOCKET_URL);

    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Connection successful
    socketInstance.on('connect', () => {
      console.log('🟢 Socket connected:', socketInstance.id);
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      setReconnectAttempt(0);
      toast.success('Connected to server', { id: 'socket-connected' });
    });

    // Disconnection
    socketInstance.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      setIsConnected(false);

      if (reason === 'io server disconnect') {
        toast.error('Disconnected by server', { id: 'socket-disconnected' });
        socketInstance.connect();
      } else if (reason === 'transport close') {
        toast.error('Connection lost', { id: 'socket-disconnected' });
      }
    });

    // Connection error
    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setConnectionError(error.message);
      setIsConnecting(false);
    });

    // Reconnection attempt
    socketInstance.on('reconnect_attempt', (attempt) => {
      console.log('🔄 Reconnection attempt:', attempt);
      setReconnectAttempt(attempt);
      setIsConnecting(true);
    });

    // Reconnection successful
    socketInstance.on('reconnect', (attempt) => {
      console.log('🟢 Reconnected after', attempt, 'attempts');
      setReconnectAttempt(0);
      setIsConnecting(false);
    });

    // Reconnection failed
    socketInstance.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
      setIsConnecting(false);
      setConnectionError('Failed to reconnect. Please refresh the page.');
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket');
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      listenersRef.current.clear();
    };
  }, []);

  // ===== Emit Event =====
  const emit = useCallback((event, data, callback) => {
    if (!socket) {
      console.warn('Socket not initialized');
      return false;
    }

    if (!socket.connected) {
      console.warn('Socket not connected');
      return false;
    }

    try {
      if (callback) {
        socket.emit(event, data, callback);
      } else {
        socket.emit(event, data);
      }
      return true;
    } catch (error) {
      console.error('Error emitting event:', error);
      return false;
    }
  }, [socket]);

  // ===== Emit with Promise =====
  const emitAsync = useCallback((event, data, timeout = 10000) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timer = setTimeout(() => {
        reject(new Error(`Request timeout for event: ${event}`));
      }, timeout);

      socket.emit(event, data, (response) => {
        clearTimeout(timer);
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }, [socket]);

  // ===== Subscribe to Event =====
  const on = useCallback((event, callback) => {
    if (!socket) {
      console.warn('Socket not initialized');
      return () => {};
    }

    socket.on(event, callback);

    // Track listener
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event).add(callback);

    // Return cleanup function
    return () => {
      socket.off(event, callback);
      listenersRef.current.get(event)?.delete(callback);
    };
  }, [socket]);

  // ===== Subscribe Once =====
  const once = useCallback((event, callback) => {
    if (!socket) return () => {};

    socket.once(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket]);

  // ===== Unsubscribe =====
  const off = useCallback((event, callback) => {
    if (!socket) return;

    if (callback) {
      socket.off(event, callback);
      listenersRef.current.get(event)?.delete(callback);
    } else {
      socket.off(event);
      listenersRef.current.delete(event);
    }
  }, [socket]);

  // ===== Reconnect =====
  const reconnect = useCallback(() => {
    if (socket) {
      socket.connect();
    }
  }, [socket]);

  // ===== Disconnect =====
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
  }, [socket]);

  // ===== Context Value =====
  const value = {
    socket,
    isConnected,
    isConnecting,
    connectionError,
    reconnectAttempt,
    socketId: socket?.id || null,
    emit,
    emitAsync,
    on,
    once,
    off,
    reconnect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

// ===== useSocket Hook =====
export function useSocket() {
  const context = useContext(SocketContext);
  
  if (context === null) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
}

// ===== Default Export =====
export default SocketContext;