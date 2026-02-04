import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Menu, X } from 'lucide-react';
import { cn } from '../../utils/helpers';

const Navbar = ({ 
  isMobileMenuOpen, 
  onMobileMenuToggle,
  className,
}) => {
  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-background/80 backdrop-blur-md',
        'border-b border-border',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center"
            >
              <Mic className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold gradient-text">VoiceDesk</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/integrations" className="text-text-secondary hover:text-text-primary transition-colors">
              Integrations
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;