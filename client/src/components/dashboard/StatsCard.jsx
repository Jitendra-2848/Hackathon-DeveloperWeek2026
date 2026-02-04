import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../ui/Card';
import { cn } from '../../utils/helpers';

const StatsCard = ({
  title,
  value,
  change,
  changeType = 'increase',
  icon: Icon,
  color = 'primary',
}) => {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
  };

  return (
    <Card hover className="relative overflow-hidden">
      {/* Background Gradient */}
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2',
          color === 'primary' && 'bg-primary',
          color === 'success' && 'bg-success',
          color === 'warning' && 'bg-warning',
          color === 'error' && 'bg-error'
        )}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors[color])}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>

          {change && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                changeType === 'increase' ? 'text-success' : 'text-error'
              )}
            >
              {changeType === 'increase' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {change}%
            </div>
          )}
        </div>

        <div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-text-primary"
          >
            {value}
          </motion.h3>
          <p className="text-sm text-text-secondary mt-1">{title}</p>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;