// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Voice States
export const VOICE_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ERROR: 'error',
};

// Socket Events
export const SOCKET_EVENTS = {
  // Client to Server
  VOICE_START: 'voice:start',
  VOICE_AUDIO: 'voice:audio',
  VOICE_STOP: 'voice:stop',
  
  // Server to Client
  VOICE_READY: 'voice:ready',
  VOICE_TRANSCRIPT: 'voice:transcript',
  VOICE_RESPONSE: 'voice:response',
  VOICE_FUNCTION_CALL: 'voice:function_call',
  VOICE_FUNCTION_RESULT: 'voice:function_result',
  VOICE_ERROR: 'voice:error',
  VOICE_STATUS: 'voice:status',
  
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
};

// Integration Types
export const INTEGRATION_TYPES = {
  TRELLO: 'trello',
  CALENDAR: 'calendar',
  NOTION: 'notion',
  SLACK: 'slack',
};

// Action Types
export const ACTION_TYPES = {
  CREATE_TASK: 'create_trello_card',
  CREATE_EVENT: 'create_calendar_event',
  CREATE_NOTE: 'create_notion_note',
  SEND_MESSAGE: 'send_slack_message',
  GET_EVENTS: 'get_todays_events',
  GET_TASKS: 'get_pending_tasks',
};

// Action Status
export const ACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
};

// Quick Commands
export const QUICK_COMMANDS = [
  { id: 1, text: "Add a task to buy groceries", icon: "CheckSquare" },
  { id: 2, text: "What's on my calendar today?", icon: "Calendar" },
  { id: 3, text: "Schedule a meeting tomorrow at 2pm", icon: "Clock" },
  { id: 4, text: "Create a note about project ideas", icon: "FileText" },
  { id: 5, text: "Send a message to my team", icon: "MessageSquare" },
  { id: 6, text: "Show my pending tasks", icon: "List" },
  { id: 7, text: "Set a reminder for 5pm", icon: "Bell" },
  { id: 8, text: "Create a high priority task", icon: "AlertCircle" },
];

// Audio Configuration
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 16000,
  CHANNELS: 1,
  CHUNK_SIZE: 4096,
};

// Animation Variants
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};