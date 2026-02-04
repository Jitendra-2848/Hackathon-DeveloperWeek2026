import { useCallback, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { SOCKET_EVENTS, VOICE_STATES } from '../utils/constants';

export const useDeepgram = (options = {}) => {
  const {
    onTranscript,
    onResponse,
    onFunctionCall,
    onFunctionResult,
    onStatusChange,
    onError,
  } = options;

  const { on, off, emit, isConnected } = useSocket();
  const callbacksRef = useRef({
    onTranscript,
    onResponse,
    onFunctionCall,
    onFunctionResult,
    onStatusChange,
    onError,
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onTranscript,
      onResponse,
      onFunctionCall,
      onFunctionResult,
      onStatusChange,
      onError,
    };
  }, [onTranscript, onResponse, onFunctionCall, onFunctionResult, onStatusChange, onError]);

  // Setup socket listeners
  useEffect(() => {
    if (!isConnected) return;

    const handleTranscript = (data) => {
      callbacksRef.current.onTranscript?.(data);
    };

    const handleResponse = (data) => {
      callbacksRef.current.onResponse?.(data);
    };

    const handleFunctionCall = (data) => {
      callbacksRef.current.onFunctionCall?.(data);
    };

    const handleFunctionResult = (data) => {
      callbacksRef.current.onFunctionResult?.(data);
    };

    const handleStatus = (data) => {
      callbacksRef.current.onStatusChange?.(data.status);
    };

    const handleError = (data) => {
      callbacksRef.current.onError?.(data);
    };

    // Subscribe to events
    on(SOCKET_EVENTS.VOICE_TRANSCRIPT, handleTranscript);
    on(SOCKET_EVENTS.VOICE_RESPONSE, handleResponse);
    on(SOCKET_EVENTS.VOICE_FUNCTION_CALL, handleFunctionCall);
    on(SOCKET_EVENTS.VOICE_FUNCTION_RESULT, handleFunctionResult);
    on(SOCKET_EVENTS.VOICE_STATUS, handleStatus);
    on(SOCKET_EVENTS.VOICE_ERROR, handleError);

    // Cleanup
    return () => {
      off(SOCKET_EVENTS.VOICE_TRANSCRIPT, handleTranscript);
      off(SOCKET_EVENTS.VOICE_RESPONSE, handleResponse);
      off(SOCKET_EVENTS.VOICE_FUNCTION_CALL, handleFunctionCall);
      off(SOCKET_EVENTS.VOICE_FUNCTION_RESULT, handleFunctionResult);
      off(SOCKET_EVENTS.VOICE_STATUS, handleStatus);
      off(SOCKET_EVENTS.VOICE_ERROR, handleError);
    };
  }, [isConnected, on, off]);

  // Start voice session
  const startSession = useCallback((config = {}) => {
    if (!isConnected) {
      console.warn('Socket not connected');
      return false;
    }

    emit(SOCKET_EVENTS.VOICE_START, config);
    return true;
  }, [isConnected, emit]);

  // Send audio data
  const sendAudio = useCallback((audioData) => {
    if (!isConnected) return false;

    emit(SOCKET_EVENTS.VOICE_AUDIO, { audio: audioData });
    return true;
  }, [isConnected, emit]);

  // End voice session
  const endSession = useCallback(() => {
    if (!isConnected) return false;

    emit(SOCKET_EVENTS.VOICE_STOP, {});
    return true;
  }, [isConnected, emit]);

  return {
    isConnected,
    startSession,
    sendAudio,
    endSession,
  };
};

export default useDeepgram;