import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Shield, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const VoicePermission = ({ onRequestPermission, error }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center p-8"
    >
      <Card className="max-w-md w-full text-center" padding="lg">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Mic className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background-secondary border-2 border-background flex items-center justify-center">
              <Shield className="w-4 h-4 text-success" />
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Microphone Access Required
        </h2>
        
        <p className="text-text-secondary mb-6">
          VoiceDesk needs access to your microphone to listen to your voice commands 
          and help you manage your tasks.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-error/10 border border-error/20">
            <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={onRequestPermission}
            variant="primary"
            size="lg"
            className="w-full"
            leftIcon={<Mic className="w-5 h-5" />}
          >
            Allow Microphone Access
          </Button>

          <p className="text-xs text-text-muted">
            Your voice data is processed securely and is not stored permanently.
          </p>
        </div>

        {/* Features list */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-text-primary mb-4">
            What you can do with voice:
          </h3>
          <ul className="space-y-2 text-left">
            {[
              'Create tasks and reminders',
              'Schedule calendar events',
              'Take notes and save ideas',
              'Send messages to your team',
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </motion.div>
  );
};

export default VoicePermission;