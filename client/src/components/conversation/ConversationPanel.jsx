import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { cn } from '../../utils/helpers';

const ConversationPanel = ({
  messages = [],
  isTyping = false,
  className,
}) => {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-background-secondary rounded-2xl border border-border',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-text-primary">Conversation</h3>
          <p className="text-xs text-text-muted">
            {messages.length} message{messages.length !== 1 && 's'}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-secondary">No messages yet</p>
            <p className="text-sm text-text-muted">
              Start talking to see the conversation here
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message}
                isLast={index === messages.length - 1}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && <TypingIndicator />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConversationPanel;