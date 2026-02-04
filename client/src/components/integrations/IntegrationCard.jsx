import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  RefreshCw,
  Settings,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Tooltip from '../ui/Tooltip';
import { cn, formatRelativeTime } from '../../utils/helpers';

const IntegrationCard = ({
  integration,
  status,
  onConnect,
  onDisconnect,
  index = 0,
}) => {
  const isConnected = status?.connected || false;
  const lastSync = status?.lastSync;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        hover
        className={cn(
          'relative overflow-hidden',
          isConnected && 'border-success/30'
        )}
        padding="lg"
      >
        {/* Connection Status Indicator */}
        <div
          className={cn(
            'absolute top-0 left-0 w-full h-1',
            isConnected ? 'bg-success' : 'bg-border'
          )}
        />

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${integration.color}15` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-2xl font-bold"
              style={{ color: integration.color }}
            >
              {integration.name.charAt(0)}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-text-primary">
                {integration.name}
              </h3>
              <Badge
                variant={isConnected ? 'success' : 'default'}
                size="sm"
                dot
              >
                {isConnected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>

            <p className="text-sm text-text-secondary mb-4 line-clamp-2">
              {integration.description}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {integration.features.slice(0, 3).map((feature, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full bg-background-tertiary text-text-secondary"
                >
                  {feature}
                </span>
              ))}
              {integration.features.length > 3 && (
                <Tooltip
                  content={integration.features.slice(3).join(', ')}
                  position="top"
                >
                  <span className="text-xs px-2 py-1 rounded-full bg-background-tertiary text-text-secondary cursor-help">
                    +{integration.features.length - 3} more
                  </span>
                </Tooltip>
              )}
            </div>

            {/* Last Sync */}
            {isConnected && lastSync && (
              <p className="text-xs text-text-muted mb-4">
                Last synced: {formatRelativeTime(lastSync)}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Sync
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Settings className="w-4 h-4" />}
                  >
                    Settings
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={onDisconnect}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onConnect}
                  leftIcon={<ExternalLink className="w-4 h-4" />}
                >
                  Connect
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default IntegrationCard;