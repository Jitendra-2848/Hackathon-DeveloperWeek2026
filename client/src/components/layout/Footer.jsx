import React from 'react';
import { Mic, Github, Twitter, Linkedin } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import Badge from '../ui/Badge';
import { cn } from '../../utils/helpers';

const Footer = ({ className }) => {
  const { isConnected } = useSocket();

  return (
    <footer
      className={cn(
        'border-t border-border bg-background-secondary',
        'px-6 py-4',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side - Status */}
        <div className="flex items-center gap-4">
          <Badge variant={isConnected ? 'success' : 'error'} size="sm" dot>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <span className="text-sm text-text-muted">
            Deepgram Voice Agent Active
          </span>
        </div>

        {/* Center - Brand */}
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary" />
          <span className="text-sm text-text-secondary">
            VoiceDesk v1.0.0
          </span>
        </div>

        {/* Right Side - Social Links */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;