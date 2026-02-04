import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Zap, 
  Shield, 
  Globe,
  ArrowRight,
  CheckCircle,
  Play,
} from 'lucide-react';
import VoiceButton from '../components/voice/VoiceButton';
import VoiceStatus from '../components/voice/VoiceStatus';
import VoicePermission from '../components/voice/VoicePermission';
import ConversationPanel from '../components/conversation/ConversationPanel';
import QuickCommands from '../components/dashboard/QuickCommands';
import RecentActions from '../components/dashboard/RecentActions';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useVoice } from '../context/VoiceContext';
import { useSocket } from '../context/SocketContext';
import { VOICE_STATES, SOCKET_EVENTS } from '../utils/constants';
import { cn } from '../utils/helpers';

const Home = () => {
  const navigate = useNavigate();
  const { isConnected, on, off } = useSocket();
  const {
    voiceState,
    setVoiceState,
    messages,
    actions,
    isPermissionGranted,
    requestPermission,
    startListening,
    stopListening,
    addMessage,
    addAction,
    updateActionStatus,
  } = useVoice();

  const [permissionError, setPermissionError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Handle permission request
  const handleRequestPermission = async () => {
    setPermissionError(null);
    const granted = await requestPermission();
    if (!granted) {
      setPermissionError('Microphone access was denied. Please allow access in your browser settings.');
    }
  };

  // Handle voice button click
  const handleVoiceStart = () => {
    if (!isPermissionGranted) {
      handleRequestPermission();
      return;
    }
    startListening();
  };

  const handleVoiceStop = () => {
    stopListening();
  };

  // Handle quick command click
  const handleQuickCommand = (command) => {
    addMessage(command, 'user');
    // Simulate AI response for demo
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(`I'll help you with: "${command}"`, 'assistant');
      
      // Add mock action
      addAction({
        type: 'create_trello_card',
        title: command,
        description: 'Action triggered by quick command',
        status: 'success',
      });
    }, 1500);
  };

  // Socket event listeners
  useEffect(() => {
    if (!isConnected) return;

    const handleTranscript = (data) => {
      if (data.text) {
        addMessage(data.text, 'user');
      }
    };

    const handleResponse = (data) => {
      setIsTyping(false);
      if (data.text) {
        addMessage(data.text, 'assistant');
      }
      setVoiceState(VOICE_STATES.SPEAKING);
    };

    const handleFunctionCall = (data) => {
      const action = addAction({
        type: data.function,
        title: data.name || data.function,
        description: JSON.stringify(data.arguments),
        status: 'pending',
      });
    };

    const handleFunctionResult = (data) => {
      updateActionStatus(data.actionId, data.success ? 'success' : 'failed', data.result);
    };

    const handleStatus = (data) => {
      setVoiceState(data.status);
      if (data.status === VOICE_STATES.PROCESSING) {
        setIsTyping(true);
      }
    };

    const handleError = (data) => {
      setVoiceState(VOICE_STATES.ERROR);
      setIsTyping(false);
    };

    // Subscribe to events
    on(SOCKET_EVENTS.VOICE_TRANSCRIPT, handleTranscript);
    on(SOCKET_EVENTS.VOICE_RESPONSE, handleResponse);
    on(SOCKET_EVENTS.VOICE_FUNCTION_CALL, handleFunctionCall);
    on(SOCKET_EVENTS.VOICE_FUNCTION_RESULT, handleFunctionResult);
    on(SOCKET_EVENTS.VOICE_STATUS, handleStatus);
    on(SOCKET_EVENTS.VOICE_ERROR, handleError);

    return () => {
      off(SOCKET_EVENTS.VOICE_TRANSCRIPT, handleTranscript);
      off(SOCKET_EVENTS.VOICE_RESPONSE, handleResponse);
      off(SOCKET_EVENTS.VOICE_FUNCTION_CALL, handleFunctionCall);
      off(SOCKET_EVENTS.VOICE_FUNCTION_RESULT, handleFunctionResult);
      off(SOCKET_EVENTS.VOICE_STATUS, handleStatus);
      off(SOCKET_EVENTS.VOICE_ERROR, handleError);
    };
  }, [isConnected, on, off]);

  // Show permission screen if not granted
  if (!isPermissionGranted) {
    return (
      <VoicePermission
        onRequestPermission={handleRequestPermission}
        error={permissionError}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-2">
          Welcome to <span className="gradient-text">VoiceDesk</span>
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Your AI-powered voice assistant for managing tasks, calendar, notes, and team communication.
        </p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Interaction Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="relative overflow-hidden" padding="lg">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-glow opacity-50" />

            <div className="relative">
              {/* Status */}
              <div className="flex justify-center mb-8">
                <VoiceStatus status={voiceState} />
              </div>

              {/* Voice Button */}
              <div className="flex justify-center mb-12">
                <VoiceButton
                  status={voiceState}
                  onStart={handleVoiceStart}
                  onStop={handleVoiceStop}
                  disabled={!isConnected}
                  size="xl"
                />
              </div>

              {/* Quick Commands */}
              <QuickCommands onCommandClick={handleQuickCommand} />
            </div>
          </Card>
        </motion.div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Conversation Panel */}
          <ConversationPanel
            messages={messages}
            isTyping={isTyping}
            className="h-[300px]"
          />

          {/* Recent Actions */}
          <RecentActions
            actions={actions}
            onViewAll={() => navigate('/history')}
          />
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
      >
        {[
          {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Real-time voice processing with Deepgram AI',
            color: 'warning',
          },
          {
            icon: Shield,
            title: 'Secure & Private',
            description: 'Your data is encrypted and never stored',
            color: 'success',
          },
          {
            icon: Globe,
            title: 'Connected',
            description: 'Integrates with Trello, Calendar, Notion & Slack',
            color: 'primary',
          },
        ].map((feature, index) => (
          <Card key={index} hover className="text-center">
            <div
              className={cn(
                'w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center',
                feature.color === 'warning' && 'bg-warning/10',
                feature.color === 'success' && 'bg-success/10',
                feature.color === 'primary' && 'bg-primary/10'
              )}
            >
              <feature.icon
                className={cn(
                  'w-6 h-6',
                  feature.color === 'warning' && 'text-warning',
                  feature.color === 'success' && 'text-success',
                  feature.color === 'primary' && 'text-primary'
                )}
              />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-text-secondary">{feature.description}</p>
          </Card>
        ))}
      </motion.div>
    </div>
  );
};

export default Home;