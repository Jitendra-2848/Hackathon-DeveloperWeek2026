import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

const Card = React.forwardRef(({
  children,
  className,
  hover = false,
  glow = false,
  glass = false,
  padding = 'md',
  ...props
}, ref) => {
  const paddingSizes = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-2xl border border-border',
        glass ? 'bg-glass backdrop-blur-md' : 'bg-background-secondary',
        hover && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-glow cursor-pointer',
        glow && 'shadow-glow',
        paddingSizes[padding],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

// Card Header Component
export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);

// Card Title Component
export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('text-lg font-semibold text-text-primary', className)} {...props}>
    {children}
  </h3>
);

// Card Description Component
export const CardDescription = ({ children, className, ...props }) => (
  <p className={cn('text-sm text-text-secondary mt-1', className)} {...props}>
    {children}
  </p>
);

// Card Content Component
export const CardContent = ({ children, className, ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

// Card Footer Component
export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('mt-4 pt-4 border-t border-border', className)} {...props}>
    {children}
  </div>
);

export default Card;