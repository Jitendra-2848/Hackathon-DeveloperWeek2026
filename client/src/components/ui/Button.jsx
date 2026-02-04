import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

const buttonVariants = {
  primary: 'bg-gradient-primary text-white hover:shadow-glow',
  secondary: 'bg-background-secondary text-text-primary border border-border hover:border-primary/50 hover:bg-background-tertiary',
  ghost: 'text-text-secondary hover:bg-glass hover:text-text-primary',
  danger: 'bg-error/10 text-error border border-error/20 hover:bg-error/20',
  success: 'bg-success/10 text-success border border-success/20 hover:bg-success/20',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'font-medium rounded-xl transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="w-5 h-5">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="w-5 h-5">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;