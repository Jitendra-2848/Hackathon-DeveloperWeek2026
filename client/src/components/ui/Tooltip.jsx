import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/helpers';

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-background-tertiary border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-background-tertiary border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-background-tertiary border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-background-tertiary border-y-transparent border-l-transparent',
};

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 px-3 py-2',
              'bg-background-tertiary text-text-primary text-sm',
              'rounded-lg border border-border shadow-lg',
              'whitespace-nowrap',
              positionClasses[position],
              className
            )}
          >
            {content}
            {/* Arrow */}
            <span
              className={cn(
                'absolute w-0 h-0 border-4',
                arrowClasses[position]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;