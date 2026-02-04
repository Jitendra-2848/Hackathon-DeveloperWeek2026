import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '../utils/constants';

/**
 * Custom hook for Socket.io connection management
 * Handles connection, reconnection, and event management
 */
export const useSocket = (options = {}) => {
  const {
    url = SOCKET_URL,
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
    reconnectionDelayMax = 5000,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  // State
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [lastPing, setLastPing] = useState(null);

  // Refs for callbacks (to avoid stale closures)
  const callbacksRef = useRef({ onConnect, onDisconnect, onError });
  const listenersRef = useRef(new Map());

  // Update callback refs
  useEffect(() => {
    callbacksRef.current = { onConnect, onDisconnect, onError };
  }, [onConnect, onDisconnect, onError]);

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect) return;

    setIsConnecting(true);

    const socketInstance = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      reconnectionDelayMax,
      timeout: 20000,
      forceNew: true,
    });

    // Connection successful
    socketInstance.on('connect', () => {
      console.log('🟢 Socket connected:', socketInstance.id);
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      setReconnectAttempt(0);
      callbacksRef.current.onConnect?.(socketInstance);
    });

    // Disconnection
    socketInstance.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      setIsConnected(false);
      callbacksRef.current.onDisconnect?.(reason);

      // Handle specific disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, need to manually reconnect
        socketInstance.connect();
      }
    });

    // Connection error
    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setConnectionError(error.message);
      setIsConnecting(false);
      callbacksRef.current.onError?.(error);
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
      setConnectionError('Failed to reconnect after multiple attempts');
    });

    // Ping/Pong for connection health
    socketInstance.on('pong', (latency) => {
      setLastPing(latency);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [url, autoConnect, reconnection, reconnectionAttempts, reconnectionDelay, reconnectionDelayMax]);

  /**
   * Manually connect to socket
   */
  const connect = useCallback(() => {
    if (socket && !socket.connected) {
      setIsConnecting(true);
      socket.connect();
    }
  }, [socket]);

  /**
   * Manually disconnect from socket
   */
  const disconnect = useCallback(() => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  }, [socket]);

  /**
   * Emit event to server
   */
  const emit = useCallback((event, data, callback) => {
    if (!socket) {
      console.warn('Socket not initialized');
      return false;
    }

    if (!socket.connected) {
      console.warn('Socket not connected');
      return false;
    }

    if (callback) {
      socket.emit(event, data, callback);
    } else {
      socket.emit(event, data);
    }

    return true;
  }, [socket]);

  /**
   * Emit event with Promise-based acknowledgment
   */
  const emitWithAck = useCallback((event, data, timeout = 10000) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timer = setTimeout(() => {
        reject(new Error('Request timeout'));
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

  /**
   * Subscribe to event
   */
  const on = useCallback((event, callback) => {
    if (!socket) {
      console.warn('Socket not initialized');
      return () => {};
    }

    socket.on(event, callback);

    // Track listener for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      socket.off(event, callback);
      listenersRef.current.get(event)?.delete(callback);
    };
  }, [socket]);

  /**
   * Subscribe to event (one-time only)
   */
  const once = useCallback((event, callback) => {
    if (!socket) {
      console.warn('Socket not initialized');
      return () => {};
    }

    socket.once(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket]);

  /**
   * Unsubscribe from event
   */
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

  /**
   * Remove all listeners for an event or all events
   */
  const removeAllListeners = useCallback((event) => {
    if (!socket) return;

    if (event) {
      socket.removeAllListeners(event);
      listenersRef.current.delete(event);
    } else {
      socket.removeAllListeners();
      listenersRef.current.clear();
    }
  }, [socket]);

  /**
   * Get socket ID
   */
  const getSocketId = useCallback(() => {
    return socket?.id || null;
  }, [socket]);

  /**
   * Check if socket is connected
   */
  const checkConnection = useCallback(() => {
    return socket?.connected || false;
  }, [socket]);

  /**
   * Send ping to check connection health
   */
  const ping = useCallback(() => {
    if (socket && socket.connected) {
      const start = Date.now();
      socket.emit('ping', null, () => {
        setLastPing(Date.now() - start);
      });
    }
  }, [socket]);

  return {
    // Socket instance
    socket,
    
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    reconnectAttempt,
    lastPing,
    
    // Connection methods
    connect,
    disconnect,
    
    // Event methods
    emit,
    emitWithAck,
    on,
    once,
    off,
    removeAllListeners,
    
    // Utility methods
    getSocketId,
    checkConnection,
    ping,
  };
};

export default useSocket;