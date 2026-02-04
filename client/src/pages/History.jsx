import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Calendar,
  Download,
  Trash2,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal, { ModalFooter } from '../components/ui/Modal';
import MessageBubble from '../components/conversation/MessageBubble';
import ActionCard from '../components/conversation/ActionCard';
import { Skeleton } from '../components/ui/Loader';
import { cn, formatDate, formatTime } from '../utils/helpers';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const History = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Simulated history data
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setConversations([
          {
            id: '1',
            date: new Date().toISOString(),
            messages: [
              { id: 'm1', content: 'Add a task to buy groceries', sender: 'user', timestamp: new Date().toISOString() },
              { id: 'm2', content: 'I\'ve created a new task "Buy groceries" in your Trello board.', sender: 'assistant', timestamp: new Date().toISOString() },
            ],
            actions: [
              { id: 'a1', type: 'create_trello_card', title: 'Buy groceries', status: 'success', timestamp: new Date().toISOString() },
            ],
          },
          {
            id: '2',
            date: new Date(Date.now() - 86400000).toISOString(),
            messages: [
              { id: 'm3', content: 'Schedule a meeting tomorrow at 3pm', sender: 'user', timestamp: new Date(Date.now() - 86400000).toISOString() },
              { id: 'm4', content: 'Done! I\'ve added "Meeting" to your calendar for tomorrow at 3:00 PM.', sender: 'assistant', timestamp: new Date(Date.now() - 86400000).toISOString() },
            ],
            actions: [
              { id: 'a2', type: 'create_calendar_event', title: 'Meeting', status: 'success', timestamp: new Date(Date.now() - 86400000).toISOString() },
            ],
          },
          {
            id: '3',
            date: new Date(Date.now() - 172800000).toISOString(),
            messages: [
              { id: 'm5', content: 'Send a message to my team about the project update', sender: 'user', timestamp: new Date(Date.now() - 172800000).toISOString() },
              { id: 'm6', content: 'I\'ve sent your message to the team channel in Slack.', sender: 'assistant', timestamp: new Date(Date.now() - 172800000).toISOString() },
            ],
            actions: [
              { id: 'a3', type: 'send_slack_message', title: 'Project update', status: 'success', timestamp: new Date(Date.now() - 172800000).toISOString() },
            ],
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        toast.error('Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.messages.some((msg) =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filterType === 'all') return matchesSearch;
    
    return matchesSearch && conv.actions.some((action) =>
      action.type.includes(filterType)
    );
  });

  const handleViewDetails = (conversation) => {
    setSelectedConversation(conversation);
    setShowDetailModal(true);
  };

  const handleClearHistory = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setConversations([]);
      setShowClearModal(false);
      toast.success('History cleared successfully');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(conversations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voicedesk-history-${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('History exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">History</h1>
          <p className="text-text-secondary">
            View your past conversations and actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            disabled={conversations.length === 0}
          >
            Export
          </Button>
          <Button
            variant="danger"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowClearModal(true)}
            disabled={conversations.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2',
                'bg-background-tertiary border border-border rounded-xl',
                'text-text-primary placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={cn(
                'appearance-none px-4 py-2 pr-10',
                'bg-background-tertiary border border-border rounded-xl',
                'text-text-primary',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
            >
              <option value="all">All Types</option>
              <option value="trello">Trello Tasks</option>
              <option value="calendar">Calendar Events</option>
              <option value="notion">Notion Notes</option>
              <option value="slack">Slack Messages</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Conversations List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, index) => (
              <Card key={index}>
                <div className="space-y-3">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-full h-16" />
                  <Skeleton className="w-24 h-8" />
                </div>
              </Card>
            ))
        ) : filteredConversations.length === 0 ? (
          <Card className="text-center py-12">
            <HistoryIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              No conversations found
            </h3>
            <p className="text-text-secondary">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Start talking to build your history'}
            </p>
          </Card>
        ) : (
          <AnimatePresence>
            {filteredConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover onClick={() => handleViewDetails(conversation)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Date */}
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-text-muted" />
                        <span className="text-sm text-text-secondary">
                          {formatDate(conversation.date)} at {formatTime(conversation.date)}
                        </span>
                      </div>

                      {/* Preview */}
                      <p className="text-text-primary line-clamp-2 mb-3">
                        {conversation.messages[0]?.content}
                      </p>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {conversation.actions.map((action) => (
                          <Badge
                            key={action.id}
                            variant={action.status === 'success' ? 'success' : 'error'}
                            size="sm"
                          >
                            {action.title}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Message Count */}
                    <div className="flex items-center gap-1 text-text-muted">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{conversation.messages.length}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Conversation Details"
        size="lg"
      >
        {selectedConversation && (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Messages */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-text-secondary">Messages</h4>
              {selectedConversation.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>

            {/* Actions */}
            {selectedConversation.actions.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-text-secondary">Actions Performed</h4>
                {selectedConversation.actions.map((action) => (
                  <ActionCard key={action.id} action={action} />
                ))}
              </div>
            )}
          </div>
        )}

        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Clear History Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear History"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 mx-auto mb-4 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-error" />
          </div>
          <p className="text-text-secondary">
            Are you sure you want to clear all conversation history? This action cannot be undone.
          </p>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClearHistory}>
            Clear All
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default History;