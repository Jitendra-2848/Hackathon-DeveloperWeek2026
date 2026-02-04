import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { VOICE_STATES } from '../../utils/constants';
import VoiceWaveform from './VoiceWaveform';

const VoiceButton = ({
  status = VOICE_STATES.IDLE,
  onStart,
  onStop,
  disabled = false,
  size = 'lg',
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const isListening = status === VOICE_STATES.LISTENING;
  const isProcessing = status === VOICE_STATES.PROCESSING;
  const isSpeaking = status === VOICE_STATES.SPEAKING;
  const isError = status === VOICE_STATES.ERROR;
  const isActive = isListening || isProcessing || isSpeaking;

  const handleClick = () => {
    if (disabled) return;
    
    if (isListening) {
      onStop?.();
    } else if (status === VOICE_STATES.IDLE) {
      onStart?.();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case VOICE_STATES.LISTENING:
        return 'from-primary to-primary-dark';
      case VOICE_STATES.PROCESSING:
        return 'from-warning to-orange-500';
      case VOICE_STATES.SPEAKING:
        return 'from-success to-emerald-500';
      case VOICE_STATES.ERROR:
        return 'from-error to-red-600';
      default:
        return 'from-primary to-primary-dark';
    }
  };

  const getIcon = () => {
    switch (status) {
      case VOICE_STATES.LISTENING:
        return <Square className={cn(iconSizes[size], 'text-white')} />;
      case VOICE_STATES.PROCESSING:
        return <Loader2 className={cn(iconSizes[size], 'text-white animate-spin')} />;
      case VOICE_STATES.SPEAKING:
        return <Mic className={cn(iconSizes[size], 'text-white')} />;
      case VOICE_STATES.ERROR:
        return <MicOff className={cn(iconSizes[size], 'text-white')} />;
      default:
        return <Mic className={cn(iconSizes[size], 'text-white')} />;
    }
  };

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Outer Glow Ring */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={cn(
              'absolute rounded-full bg-gradient-to-r',
              getStatusColor(),
              size === 'sm' && 'w-24 h-24',
              size === 'md' && 'w-36 h-36',
              size === 'lg' && 'w-48 h-48',
              size === 'xl' && 'w-56 h-56'
            )}
            style={{ filter: 'blur(20px)' }}
          />
        )}
      </AnimatePresence>

      {/* Waveform (when listening) */}
      <AnimatePresence>
        {isListening && (
          <VoiceWaveform 
            isActive={isListening}
            size={size}
          />
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={handleClick}
        disabled={disabled || isProcessing || isSpeaking}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={cn(
          'relative z-10 rounded-full',
          'bg-gradient-to-r',
          getStatusColor(),
          'flex items-center justify-center',
          'shadow-lg transition-shadow duration-300',
          'focus:outline-none focus:ring-4 focus:ring-primary/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isActive && 'shadow-glow-lg',
          sizes[size]
        )}
      >
        {/* Gradient Border */}
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-to-r from-primary via-primary-dark to-primary',
            'p-[2px]'
          )}
        >
          <div
            className={cn(
              'w-full h-full rounded-full',
              'bg-gradient-to-r',
              getStatusColor(),
              'flex items-center justify-center'
            )}
          >
            {getIcon()}
          </div>
        </div>
      </motion.button>

      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <span
          className={cn(
            'text-sm font-medium',
            isListening && 'text-primary',
            isProcessing && 'text-warning',
            isSpeaking && 'text-success',
            isError && 'text-error',
            status === VOICE_STATES.IDLE && 'text-text-secondary'
          )}
        >
          {status === VOICE_STATES.IDLE && (isHovered ? 'Click to speak' : 'Tap to start')}
          {isListening && 'Listening...'}
          {isProcessing && 'Processing...'}
          {isSpeaking && 'Speaking...'}
          {isError && 'Error occurred'}
        </span>
      </motion.div>
    </div>
  );
};

export default VoiceButton;