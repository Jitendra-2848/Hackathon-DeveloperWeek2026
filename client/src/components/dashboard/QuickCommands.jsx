import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  FileText, 
  MessageSquare,
  List,
  Bell,
  AlertCircle,
  Zap,
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../ui/Card';
import { QUICK_COMMANDS } from '../../utils/constants';
import { cn } from '../../utils/helpers';

const iconMap = {
  CheckSquare,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  List,
  Bell,
  AlertCircle,
};

const QuickCommands = ({ onCommandClick }) => {
  return (
    <Card padding="none" className="overflow-hidden">
      <CardHeader className="px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <CardTitle>Quick Commands</CardTitle>
        </div>
      </CardHeader>

      <div className="p-4">
        <p className="text-sm text-text-secondary mb-4">
          Click any command to speak it instantly
        </p>

        <div className="flex flex-wrap gap-2">
          {QUICK_COMMANDS.map((command, index) => {
            const Icon = iconMap[command.icon] || Zap;

            return (
              <motion.button
                key={command.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCommandClick?.(command.text)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-2',
                  'bg-background-tertiary border border-border rounded-full',
                  'text-sm text-text-secondary',
                  'hover:border-primary/50 hover:text-primary',
                  'transition-all duration-200'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{command.text}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default QuickCommands;