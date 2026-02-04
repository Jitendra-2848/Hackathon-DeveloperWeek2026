import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-start gap-3"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>

      {/* Typing Dots */}
      <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-background-tertiary border border-border">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="w-2 h-2 rounded-full bg-text-muted"
              animate={{
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: index * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;