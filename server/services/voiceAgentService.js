

import { v4 as uuidv4 } from 'uuid';
import { deepgramService } from './deepgramService.js';
import { functionRegistry } from '../functions/functionRegistry.js';
import { deepgramConfig } from '../config/deepgram.config.js';
import { logger } from '../utils/logger.js';

class VoiceAgentService {
  constructor() {
    this.sessions = new Map();
  }

  
  createSession(socketId, options = {}) {
    const sessionId = uuidv4();

    const session = {
      id: sessionId,
      socketId,
      createdAt: new Date(),
      status: 'idle',
      transcript: '',
      messages: [],
      actions: [],
      config: {
        voice: options.voice || deepgramConfig.agent.speak.model,
        language: options.language || deepgramConfig.agent.listen.language,
      },
    };

    this.sessions.set(socketId, session);
    logger.info('Voice session created', { sessionId, socketId });

    return session;
  }

  
  getSession(socketId) {
    return this.sessions.get(socketId);
  }

  
  updateStatus(socketId, status) {
    const session = this.sessions.get(socketId);
    if (session) {
      session.status = status;
      session.updatedAt = new Date();
    }
    return session;
  }

  
  addMessage(socketId, content, role = 'user') {
    const session = this.sessions.get(socketId);
    if (session) {
      const message = {
        id: uuidv4(),
        role,
        content,
        timestamp: new Date().toISOString(),
      };
      session.messages.push(message);
      return message;
    }
    return null;
  }

  
  addAction(socketId, action) {
    const session = this.sessions.get(socketId);
    if (session) {
      const actionRecord = {
        id: uuidv4(),
        ...action,
        timestamp: new Date().toISOString(),
        status: 'pending',
      };
      session.actions.push(actionRecord);
      return actionRecord;
    }
    return null;
  }

  
  updateAction(socketId, actionId, status, result = null) {
    const session = this.sessions.get(socketId);
    if (session) {
      const action = session.actions.find(a => a.id === actionId);
      if (action) {
        action.status = status;
        action.result = result;
        action.completedAt = new Date().toISOString();
        return action;
      }
    }
    return null;
  }

  
  async processInput(socketId, input) {
    const session = this.sessions.get(socketId);
    if (!session) {
      throw new Error('Session not found');
    }

    logger.debug('Processing input', { socketId, input });

    
    this.addMessage(socketId, input, 'user');

    
    const intent = this.analyzeIntent(input);

    
    if (intent.function) {
      
      const action = this.addAction(socketId, {
        type: intent.function,
        name: intent.name,
        arguments: intent.arguments,
      });

      
      try {
        const result = await functionRegistry.execute(intent.function, intent.arguments);
        this.updateAction(socketId, action.id, result.success ? 'success' : 'failed', result.data);

        
        const response = this.generateResponse(intent, result);
        this.addMessage(socketId, response, 'assistant');

        return {
          response,
          action: {
            ...action,
            status: result.success ? 'success' : 'failed',
            result: result.data,
          },
          intent,
        };
      } catch (error) {
        this.updateAction(socketId, action.id, 'failed', { error: error.message });
        throw error;
      }
    }

    
    const response = this.generateGeneralResponse(input);
    this.addMessage(socketId, response, 'assistant');

    return {
      response,
      action: null,
      intent: null,
    };
  }

  
  analyzeIntent(text) {
    const lowerText = text.toLowerCase();

    
    if (this.matchesPatterns(lowerText, ['add a task', 'create a task', 'add task', 'remind me', 'todo', 'new task'])) {
      return {
        function: 'create_trello_card',
        name: 'Create Task',
        arguments: this.extractTaskArgs(text),
      };
    }

    
    if (this.matchesPatterns(lowerText, ['schedule', 'meeting', 'appointment', 'calendar', 'event'])) {
      return {
        function: 'create_calendar_event',
        name: 'Schedule Event',
        arguments: this.extractEventArgs(text),
      };
    }

    
    if (this.matchesPatterns(lowerText, ['note', 'write down', 'remember', 'save', 'jot down'])) {
      return {
        function: 'create_notion_note',
        name: 'Create Note',
        arguments: this.extractNoteArgs(text),
      };
    }

    
    if (this.matchesPatterns(lowerText, ['send', 'message', 'tell', 'slack', 'notify'])) {
      return {
        function: 'send_slack_message',
        name: 'Send Message',
        arguments: this.extractMessageArgs(text),
      };
    }

    
    if (this.matchesPatterns(lowerText, ["what's on", 'my schedule', 'events today', 'calendar today'])) {
      return {
        function: 'get_todays_events',
        name: 'Get Events',
        arguments: {},
      };
    }

    if (this.matchesPatterns(lowerText, ['pending tasks', 'my tasks', 'todo list', 'task list'])) {
      return {
        function: 'get_pending_tasks',
        name: 'Get Tasks',
        arguments: {},
      };
    }

    return { function: null };
  }

  
  matchesPatterns(text, patterns) {
    return patterns.some(pattern => text.includes(pattern));
  }

  
  extractTaskArgs(text) {
    const match = text.match(/(?:add a task|create a task|add task|remind me to|todo)\s*(?:to\s*)?(.+)/i);
    return {
      title: match ? match[1].trim() : text,
      description: '',
      priority: text.toLowerCase().includes('urgent') || text.toLowerCase().includes('high priority') ? 'high' : 'medium',
    };
  }

  
  extractEventArgs(text) {
    const timeMatch = text.match(/(?:at|for)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    const dateMatch = text.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);

    
    let title = text
      .replace(/schedule|meeting|appointment|calendar|event/gi, '')
      .replace(/(?:at|for)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi, '')
      .replace(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (title.length < 3) {
      title = text.includes('meeting') ? 'Meeting' : 'Event';
    }

    return {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      start_time: timeMatch ? timeMatch[1] : '9:00 AM',
      date: dateMatch ? dateMatch[1] : 'today',
      description: '',
    };
  }

  
  extractNoteArgs(text) {
    const match = text.match(/(?:note|write down|remember|save|jot down)\s*(?:that\s*)?(.+)/i);
    const content = match ? match[1].trim() : text;

    return {
      title: content.slice(0, 50),
      content: content,
      tags: [],
    };
  }

  
  extractMessageArgs(text) {
    const match = text.match(/(?:send|message|tell|slack|notify)\s*(?:my team|the team|them|everyone)?\s*(?:that\s*)?(.+)/i);

    return {
      message: match ? match[1].trim() : text,
      channel: 'general',
    };
  }

  
  generateResponse(intent, result) {
    if (!result.success) {
      return `I'm sorry, I couldn't complete that action. ${result.error || 'Please try again.'}`;
    }

    const responses = {
      create_trello_card: `Done! I've created a task "${intent.arguments.title}" in your Trello board. Is there anything else?`,
      create_calendar_event: `I've added "${intent.arguments.title}" to your calendar for ${intent.arguments.date} at ${intent.arguments.start_time}. Would you like to add more details?`,
      create_notion_note: `I've saved that note for you with the title "${intent.arguments.title}". Anything else?`,
      send_slack_message: `Your message has been sent to the team. Is there anything else you need?`,
      get_todays_events: this.formatEventsResponse(result.data),
      get_pending_tasks: this.formatTasksResponse(result.data),
    };

    return responses[intent.function] || "I've completed that action for you. What else can I help with?";
  }

  
  formatEventsResponse(events) {
    if (!events || events.length === 0) {
      return "You don't have any events scheduled for today. Would you like to add one?";
    }
    return `You have ${events.length} event${events.length > 1 ? 's' : ''} today: ${events.map(e => e.title).join(', ')}. Would you like more details?`;
  }

  
  formatTasksResponse(tasks) {
    if (!tasks || tasks.length === 0) {
      return "You don't have any pending tasks. Great job staying on top of things!";
    }
    return `You have ${tasks.length} pending task${tasks.length > 1 ? 's' : ''}. The top ones are: ${tasks.slice(0, 3).map(t => t.title).join(', ')}.`;
  }

  
  generateGeneralResponse(input) {
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const lowerInput = input.toLowerCase();

    if (greetings.some(g => lowerInput.includes(g))) {
      return "Hello! I'm VoiceDesk, your personal assistant. I can help you create tasks, schedule events, take notes, or send messages. What would you like to do?";
    }

    if (lowerInput.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }

    if (lowerInput.includes('help')) {
      return "I can help you with: creating tasks in Trello, scheduling events in Google Calendar, taking notes in Notion, and sending messages via Slack. Just tell me what you'd like to do!";
    }

    return "I heard you! You can ask me to create tasks, schedule events, take notes, or send messages. How can I help?";
  }

  
  endSession(socketId) {
    const session = this.sessions.get(socketId);
    if (session) {
      session.endedAt = new Date();
      session.status = 'ended';
      
      
      logger.info('Voice session ended', {
        sessionId: session.id,
        duration: session.endedAt - session.createdAt,
        messagesCount: session.messages.length,
        actionsCount: session.actions.length,
      });

      this.sessions.delete(socketId);
      return session;
    }
    return null;
  }

  
  getActiveSessions() {
    return Array.from(this.sessions.values());
  }

  
  getSessionCount() {
    return this.sessions.size;
  }
}


export const voiceAgentService = new VoiceAgentService();
export default voiceAgentService;