import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { VOICE_STATES, SOCKET_EVENTS, AUDIO_CONFIG } from '../utils/constants';
import { audioService } from '../services/audioService';

export const useVoice = () => {
  const { emit, on, off, isConnected } = useSocket();
  
  const [voiceState, setVoiceState] = useState(VOICE_STATES.IDLE);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [audioLevels, setAudioLevels] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isConnected) {
      setError('Not connected to server');
      return false;
    }

    try {
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
          channelCount: AUDIO_CONFIG.CHANNELS,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioStreamRef.current = stream;

      // Create analyser for visualization
      analyserRef.current = audioService.createAnalyser(stream);

      // Start level monitoring
      const updateLevels = () => {
        const levels = audioService.getAudioLevels();
        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle audio data
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && isConnected) {
          const buffer = await event.data.arrayBuffer();
          emit(SOCKET_EVENTS.VOICE_AUDIO, {
            audio: Array.from(new Uint8Array(buffer)),
          });
        }
      };

      // Start recording
      mediaRecorder.start(250);
      setVoiceState(VOICE_STATES.LISTENING);

      // Notify server
      emit(SOCKET_EVENTS.VOICE_START, {});

      return true;
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(err.message);
      setVoiceState(VOICE_STATES.ERROR);
      return false;
    }
  }, [isConnected, emit]);

  // Stop recording
  const stopRecording = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Stop audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    // Reset audio levels
    setAudioLevels([]);

    // Notify server
    if (isConnected) {
      emit(SOCKET_EVENTS.VOICE_STOP, {});
    }

    setVoiceState(VOICE_STATES.PROCESSING);
  }, [isConnected, emit]);

  // Handle incoming audio response
  const playResponse = useCallback(async (audioData) => {
    try {
      setVoiceState(VOICE_STATES.SPEAKING);
      await audioService.playAudio(audioData);
      setVoiceState(VOICE_STATES.IDLE);
    } catch (err) {
      console.error('Failed to play audio:', err);
      setVoiceState(VOICE_STATES.IDLE);
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    stopRecording();
    setVoiceState(VOICE_STATES.IDLE);
    setTranscript('');
    setError(null);
    setAudioLevels([]);
  }, [stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  return {
    voiceState,
    setVoiceState,
    transcript,
    setTranscript,
    error,
    audioLevels,
    startRecording,
    stopRecording,
    playResponse,
    reset,
  };
};

export default useVoice;