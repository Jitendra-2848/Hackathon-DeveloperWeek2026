import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from './SocketContext';
import { VOICE_STATES, SOCKET_EVENTS } from '../utils/constants';
import { generateId } from '../utils/helpers';

const VoiceContext = createContext(undefined);

export function VoiceProvider({ children }) {
  const { emit, on, off, isConnected } = useSocket();
  
  // State
  const [voiceState, setVoiceState] = useState(VOICE_STATES.IDLE);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [actions, setActions] = useState([]);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);

  // Add message to conversation
  const addMessage = useCallback((content, sender = 'user') => {
    const message = {
      id: generateId(),
      content,
      sender,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  // Add action to list
  const addAction = useCallback((action) => {
    const newAction = {
      id: generateId(),
      ...action,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    setActions((prev) => [newAction, ...prev]);
    return newAction;
  }, []);

  // Update action status
  const updateActionStatus = useCallback((actionId, status, result = null) => {
    setActions((prev) =>
      prev.map((action) =>
        action.id === actionId
          ? { ...action, status, result }
          : action
      )
    );
  }, []);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      stream.getTracks().forEach((track) => track.stop());
      setIsPermissionGranted(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      toast.error('Microphone access denied. Please allow microphone access.');
      setIsPermissionGranted(false);
      return false;
    }
  }, []);

  // Start voice session
  const startListening = useCallback(async () => {
    if (!isConnected) {
      toast.error('Not connected to server');
      return;
    }

    try {
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      audioStreamRef.current = stream;
      setVoiceState(VOICE_STATES.LISTENING);

      // Notify server
      emit(SOCKET_EVENTS.VOICE_START, {});

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && isConnected) {
          // Convert to array buffer and send
          event.data.arrayBuffer().then((buffer) => {
            emit(SOCKET_EVENTS.VOICE_AUDIO, {
              audio: Array.from(new Uint8Array(buffer)),
            });
          });
        }
      };

      mediaRecorder.start(250); // Send chunks every 250ms
      
      toast.success('Listening...');
    } catch (error) {
      console.error('Error starting voice session:', error);
      toast.error('Failed to start listening');
      setVoiceState(VOICE_STATES.ERROR);
    }
  }, [isConnected, emit]);

  // Stop voice session
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    setVoiceState(VOICE_STATES.PROCESSING);
    emit(SOCKET_EVENTS.VOICE_STOP, {});
  }, [emit]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setTranscript('');
  }, []);

  // Clear actions
  const clearActions = useCallback(() => {
    setActions([]);
  }, []);

  const value = {
    // State
    voiceState,
    setVoiceState,
    transcript,
    setTranscript,
    messages,
    actions,
    isPermissionGranted,
    
    // Actions
    requestPermission,
    startListening,
    stopListening,
    addMessage,
    addAction,
    updateActionStatus,
    clearConversation,
    clearActions,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}

export default VoiceContext;