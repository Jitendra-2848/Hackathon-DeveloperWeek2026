import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

const VoiceWaveform = ({ 
  isActive = false, 
  audioLevels = [],
  size = 'lg',
  className,
}) => {
  const [levels, setLevels] = useState(Array(9).fill(0.3));

  // Simulate audio levels if not provided
  useEffect(() => {
    if (!isActive) {
      setLevels(Array(9).fill(0.3));
      return;
    }

    if (audioLevels.length > 0) {
      setLevels(audioLevels);
      return;
    }

    // Simulate random levels for demo
    const interval = setInterval(() => {
      setLevels(
        Array(9)
          .fill(0)
          .map(() => 0.2 + Math.random() * 0.8)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, audioLevels]);

  const containerSizes = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48',
    xl: 'w-56 h-56',
  };

  const barHeights = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-10',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'absolute inset-0 flex items-center justify-center',
        containerSizes[size],
        className
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {levels.map((level, index) => (
          <motion.div
            key={index}
            className={cn(
              'w-1 rounded-full bg-gradient-to-t from-primary to-primary-dark',
              barHeights[size]
            )}
            animate={{
              scaleY: isActive ? level : 0.3,
              opacity: isActive ? 0.7 + level * 0.3 : 0.5,
            }}
            transition={{
              duration: 0.1,
              ease: 'easeOut',
            }}
            style={{
              transformOrigin: 'center',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default VoiceWaveform;