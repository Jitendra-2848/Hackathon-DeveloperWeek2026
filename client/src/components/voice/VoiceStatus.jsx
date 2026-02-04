import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Loader2, 
  Volume2, 
  AlertCircle,
  CheckCircle 
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { VOICE_STATES } from '../../utils/constants';

const VoiceStatus = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case VOICE_STATES.LISTENING:
        return {
          icon: Mic,
          text: 'Listening',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20',
        };
      case VOICE_STATES.PROCESSING:
        return {
          icon: Loader2,
          text: 'Processing',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          animate: true,
        };
      case VOICE_STATES.SPEAKING:
        return {
          icon: Volume2,
          text: 'Speaking',
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
        };
      case VOICE_STATES.ERROR:
        return {
          icon: AlertCircle,
          text: 'Error',
          color: 'text-error',
          bgColor: 'bg-error/10',
          borderColor: 'border-error/20',
        };
      default:
        return {
          icon: MicOff,
          text: 'Ready',
          color: 'text-text-secondary',
          bgColor: 'bg-glass',
          borderColor: 'border-border',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2',
        'rounded-full border',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon 
        className={cn(
          'w-4 h-4',
          config.color,
          config.animate && 'animate-spin'
        )} 
      />
      <span className={cn('text-sm font-medium', config.color)}>
        {config.text}
      </span>

      {/* Pulse indicator for active states */}
      {(status === VOICE_STATES.LISTENING || status === VOICE_STATES.SPEAKING) && (
        <motion.span
          className={cn('w-2 h-2 rounded-full', config.color.replace('text-', 'bg-'))}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
};

export default VoiceStatus;