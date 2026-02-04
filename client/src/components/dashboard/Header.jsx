import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Bell, 
  Search,
  Menu,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Tooltip from '../ui/Tooltip';
import { cn } from '../../utils/helpers';

const Header = ({ onMenuClick, className }) => {
  const { isDark, toggleTheme } = useTheme();
  const { isConnected } = useSocket();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 h-16',
        'bg-background/80 backdrop-blur-md',
        'border-b border-border',
        'flex items-center justify-between px-6',
        className
      )}
    >
      {/* Left Side */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search commands..."
            className={cn(
              'w-64 pl-10 pr-4 py-2',
              'bg-background-secondary border border-border rounded-xl',
              'text-sm text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
              'transition-all duration-200'
            )}
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <Badge 
          variant={isConnected ? 'success' : 'error'} 
          size="sm" 
          dot
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>

        {/* Notifications */}
        <Tooltip content="Notifications" position="bottom">
          <button className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </button>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip content={isDark ? 'Light Mode' : 'Dark Mode'} position="bottom">
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.button>
        </Tooltip>

        {/* User Avatar */}
        <Tooltip content="Profile" position="bottom">
          <button className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium">
            U
          </button>
        </Tooltip>
      </div>
    </header>
  );
};

export default Header;