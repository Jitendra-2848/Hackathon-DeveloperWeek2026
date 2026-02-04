import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  LayoutDashboard,
  Plug,
  History,
  Settings,
  Mic,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/integrations', icon: Plug, label: 'Integrations' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 240 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed left-0 top-0 h-full z-40',
        'bg-background-secondary border-r border-border',
        'flex flex-col'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold gradient-text"
            >
              VoiceDesk
            </motion.span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl',
                'transition-all duration-200',
                'hover:bg-glass',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0')} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
              
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-border">
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center justify-center w-full py-2 rounded-xl',
            'text-text-secondary hover:text-text-primary hover:bg-glass',
            'transition-all duration-200'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;