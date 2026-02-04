import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { cn, formatTime } from '../../utils/helpers';

const MessageBubble = ({ message, isLast }) => {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser 
            ? 'bg-primary/10' 
            : 'bg-gradient-primary'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[75%] flex flex-col gap-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-gradient-primary text-white rounded-br-md'
              : 'bg-background-tertiary text-text-primary border border-border rounded-bl-md'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-text-muted px-2">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

export default MessageBubble;