import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import Footer from './Footer';
import { cn } from '../../utils/helpers';

const MainLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isMobileMenuOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 z-50 lg:hidden"
      >
        <Sidebar
          isCollapsed={false}
          onToggle={() => setIsMobileMenuOpen(false)}
        />
      </motion.div>

      {/* Main Content */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'
        )}
      >
        <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;