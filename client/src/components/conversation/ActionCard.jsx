import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  CheckSquare,
  Calendar,
  FileText,
  MessageSquare,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn, formatRelativeTime, getActionIcon } from '../../utils/helpers';
import { ACTION_STATUS } from '../../utils/constants';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const iconMap = {
  CheckSquare,
  Calendar,
  FileText,
  MessageSquare,
};

const ActionCard = ({ 
  action, 
  onRetry,
  expanded = false,
  onToggleExpand,
}) => {
  const { type, title, description, status, result, timestamp } = action;
  
  const IconComponent = iconMap[getActionIcon(type)] || CheckSquare;

  const getStatusBadge = () => {
    switch (status) {
      case ACTION_STATUS.SUCCESS:
        return (
          <Badge variant="success" size="sm" dot>
            Completed
          </Badge>
        );
      case ACTION_STATUS.FAILED:
        return (
          <Badge variant="error" size="sm" dot>
            Failed
          </Badge>
        );
      case ACTION_STATUS.PENDING:
      default:
        return (
          <Badge variant="warning" size="sm" dot>
            Processing
          </Badge>
        );
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case ACTION_STATUS.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-success" />;
      case ACTION_STATUS.FAILED:
        return <XCircle className="w-5 h-5 text-error" />;
      case ACTION_STATUS.PENDING:
      default:
        return <Loader2 className="w-5 h-5 text-warning animate-spin" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'p-4 rounded-xl border bg-background-tertiary',
        status === ACTION_STATUS.SUCCESS && 'border-success/20',
        status === ACTION_STATUS.FAILED && 'border-error/20',
        status === ACTION_STATUS.PENDING && 'border-warning/20'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
            status === ACTION_STATUS.SUCCESS && 'bg-success/10',
            status === ACTION_STATUS.FAILED && 'bg-error/10',
            status === ACTION_STATUS.PENDING && 'bg-warning/10'
          )}
        >
          <IconComponent
            className={cn(
              'w-5 h-5',
              status === ACTION_STATUS.SUCCESS && 'text-success',
              status === ACTION_STATUS.FAILED && 'text-error',
              status === ACTION_STATUS.PENDING && 'text-warning'
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-medium text-text-primary truncate">
              {title}
            </h4>
            {getStatusBadge()}
          </div>

          {description && (
            <p className="text-xs text-text-secondary line-clamp-2">
              {description}
            </p>
          )}

          {/* Timestamp */}
          <p className="text-xs text-text-muted mt-2">
            {formatRelativeTime(timestamp)}
          </p>

          {/* Expanded Details */}
          {expanded && result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-border"
            >
              <pre className="text-xs text-text-secondary overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {status === ACTION_STATUS.FAILED && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRetry(action)}
              className="p-2"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}

          {result && onToggleExpand && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className="p-2"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ActionCard;