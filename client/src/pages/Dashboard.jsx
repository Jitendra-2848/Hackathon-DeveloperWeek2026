import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Activity,
  Clock,
  Zap,
} from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import RecentActions from '../components/dashboard/RecentActions';
import QuickCommands from '../components/dashboard/QuickCommands';
import ConversationPanel from '../components/conversation/ConversationPanel';
import VoiceButton from '../components/voice/VoiceButton';
import VoiceStatus from '../components/voice/VoiceStatus';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Loader';
import { useVoice } from '../context/VoiceContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';
import { cn } from '../utils/helpers';

const Dashboard = () => {
  const { isConnected } = useSocket();
  const {
    voiceState,
    messages,
    actions,
    startListening,
    stopListening,
  } = useVoice();

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulated stats for demo
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStats({
          totalCommands: 127,
          tasksCreated: 45,
          eventsScheduled: 23,
          messagesSent: 18,
          commandsChange: 12,
          tasksChange: 8,
          eventsChange: 15,
          messagesChange: -5,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleQuickCommand = (command) => {
    console.log('Quick command:', command);
    // Handle quick command
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">
            Overview of your voice assistant activity
          </p>
        </div>
        <VoiceStatus status={voiceState} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          // Loading Skeletons
          Array(4)
            .fill(0)
            .map((_, index) => (
              <Card key={index} padding="lg">
                <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                <Skeleton className="w-20 h-8 mb-2" />
                <Skeleton className="w-32 h-4" />
              </Card>
            ))
        ) : (
          <>
            <StatsCard
              title="Total Commands"
              value={stats?.totalCommands || 0}
              change={stats?.commandsChange}
              changeType="increase"
              icon={Mic}
              color="primary"
            />
            <StatsCard
              title="Tasks Created"
              value={stats?.tasksCreated || 0}
              change={stats?.tasksChange}
              changeType="increase"
              icon={CheckSquare}
              color="success"
            />
            <StatsCard
              title="Events Scheduled"
              value={stats?.eventsScheduled || 0}
              change={stats?.eventsChange}
              changeType="increase"
              icon={Calendar}
              color="warning"
            />
            <StatsCard
              title="Messages Sent"
              value={stats?.messagesSent || 0}
              change={Math.abs(stats?.messagesChange || 0)}
              changeType={stats?.messagesChange >= 0 ? 'increase' : 'decrease'}
              icon={MessageSquare}
              color="error"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Voice & Quick Commands */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voice Control Card */}
          <Card className="relative overflow-hidden" padding="lg">
            <div className="absolute inset-0 bg-gradient-glow opacity-30" />
            
            <div className="relative flex flex-col items-center">
              <h2 className="text-xl font-semibold text-text-primary mb-6">
                Voice Control
              </h2>
              
              <VoiceButton
                status={voiceState}
                onStart={startListening}
                onStop={stopListening}
                disabled={!isConnected}
                size="lg"
              />

              <div className="mt-8 w-full">
                <QuickCommands onCommandClick={handleQuickCommand} />
              </div>
            </div>
          </Card>

          {/* Activity Chart Placeholder */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <CardTitle>Activity Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-secondary">Activity chart coming soon</p>
                  <p className="text-sm text-text-muted">
                    Track your voice command usage over time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Conversation Panel */}
          <ConversationPanel
            messages={messages}
            isTyping={isTyping}
            className="h-[350px]"
          />

          {/* Recent Actions */}
          <RecentActions actions={actions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;