import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronRight } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../ui/Card';
import ActionCard from '../conversation/ActionCard';
import Button from '../ui/Button';

const RecentActions = ({ actions = [], onViewAll }) => {
  const [expandedId, setExpandedId] = useState(null);

  const displayActions = actions.slice(0, 5);

  return (
    <Card padding="none" className="overflow-hidden">
      <CardHeader className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <CardTitle>Recent Actions</CardTitle>
          </div>
          
          {onViewAll && actions.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              View All
            </Button>
          )}
        </div>
      </CardHeader>

      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {displayActions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-glass mx-auto mb-3 flex items-center justify-center">
              <Activity className="w-6 h-6 text-text-muted" />
            </div>
            <p className="text-text-secondary">No actions yet</p>
            <p className="text-sm text-text-muted">
              Your voice commands will appear here
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {displayActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                expanded={expandedId === action.id}
                onToggleExpand={() => 
                  setExpandedId(expandedId === action.id ? null : action.id)
                }
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
};

export default RecentActions;