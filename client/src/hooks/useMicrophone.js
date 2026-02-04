import { useState, useCallback, useEffect } from 'react';

export const useMicrophone = () => {
  const [isSupported, setIsSupported] = useState(true);
  const [permission, setPermission] = useState('prompt'); // 'granted' | 'denied' | 'prompt'
  const [error, setError] = useState(null);

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      const supported = !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia &&
        (window.AudioContext || window.webkitAudioContext) &&
        window.MediaRecorder
      );
      setIsSupported(supported);

      if (!supported) {
        setError('Your browser does not support audio recording');
      }
    };

    checkSupport();
  }, []);

  // Check permission status
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' });
          setPermission(result.state);

          result.onchange = () => {
            setPermission(result.state);
          };
        }
      } catch (err) {
        // Some browsers don't support permission query for microphone
        console.log('Permission query not supported');
      }
    };

    checkPermission();
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop tracks immediately - we just needed to check permission
      stream.getTracks().forEach((track) => track.stop());
      
      setPermission('granted');
      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      
      if (err.name === 'NotAllowedError') {
        setPermission('denied');
        setError('Microphone access was denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Failed to access microphone. Please try again.');
      }
      
      return false;
    }
  }, []);

  return {
    isSupported,
    permission,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    error,
    requestPermission,
  };
};

export default useMicrophone;