import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

const loaderSizes = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

// Spinner Loader
export const Spinner = ({ size = 'md', className }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    className={cn(
      'rounded-full border-2 border-border border-t-primary',
      loaderSizes[size],
      className
    )}
  />
);

// Dots Loader
export const DotsLoader = ({ size = 'md', className }) => {
  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn('rounded-full bg-primary', dotSize[size])}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.15,
          }}
        />
      ))}
    </div>
  );
};

// Pulse Loader
export const PulseLoader = ({ size = 'md', className }) => (
  <motion.div
    className={cn(
      'rounded-full bg-primary/30',
      loaderSizes[size],
      className
    )}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
    }}
  />
);

// Skeleton Loader
export const Skeleton = ({ className, ...props }) => (
  <div
    className={cn(
      'skeleton rounded-lg bg-background-tertiary',
      className
    )}
    {...props}
  />
);

// Main Loader Component
const Loader = ({ 
  size = 'md', 
  variant = 'spinner',
  text,
  className,
}) => {
  const LoaderComponent = {
    spinner: Spinner,
    dots: DotsLoader,
    pulse: PulseLoader,
  }[variant];

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <LoaderComponent size={size} />
      {text && (
        <p className="text-sm text-text-secondary animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default Loader;