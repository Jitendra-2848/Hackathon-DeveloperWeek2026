import { useState, useCallback, useRef } from 'react';

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const startTimeRef = useRef(0);

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play audio from ArrayBuffer
  const playBuffer = useCallback(async (arrayBuffer) => {
    const audioContext = getAudioContext();

    try {
      // Resume context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Stop any currently playing audio
      if (sourceRef.current) {
        sourceRef.current.stop();
      }

      // Create new source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      sourceRef.current = source;
      setDuration(audioBuffer.duration);
      setIsPlaying(true);
      startTimeRef.current = audioContext.currentTime;

      // Handle playback end
      source.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        sourceRef.current = null;
      };

      // Start playback
      source.start(0);

      // Update current time
      const updateTime = () => {
        if (sourceRef.current && isPlaying) {
          const elapsed = audioContext.currentTime - startTimeRef.current;
          setCurrentTime(elapsed);
          requestAnimationFrame(updateTime);
        }
      };
      updateTime();

      return true;
    } catch (err) {
      console.error('Failed to play audio:', err);
      setIsPlaying(false);
      return false;
    }
  }, [getAudioContext, isPlaying]);

  // Play audio from URL
  const playUrl = useCallback(async (url) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return playBuffer(arrayBuffer);
    } catch (err) {
      console.error('Failed to fetch audio:', err);
      return false;
    }
  }, [playBuffer]);

  // Stop playback
  const stop = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    stop();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stop]);

  return {
    isPlaying,
    duration,
    currentTime,
    progress: duration > 0 ? currentTime / duration : 0,
    playBuffer,
    playUrl,
    stop,
    cleanup,
  };
};

export default useAudio;