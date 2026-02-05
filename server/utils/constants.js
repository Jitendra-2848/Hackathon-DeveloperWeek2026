


export const SOCKET_EVENTS = {
  
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  
  VOICE_START: 'voice:start',
  VOICE_AUDIO: 'voice:audio',
  VOICE_STOP: 'voice:stop',
  VOICE_TEXT: 'voice:text',
  
  
  VOICE_READY: 'voice:ready',
  VOICE_TRANSCRIPT: 'voice:transcript',
  VOICE_RESPONSE: 'voice:response',
  VOICE_FUNCTION_CALL: 'voice:function_call',
  VOICE_FUNCTION_RESULT: 'voice:function_result',
  VOICE_ERROR: 'voice:error',
  VOICE_STATUS: 'voice:status',
  VOICE_AUDIO_RESPONSE: 'voice:audio_response',
};


export const VOICE_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ERROR: 'error',
};


export const INTEGRATION_TYPES = {
  TRELLO: 'trello',
  CALENDAR: 'calendar',
  NOTION: 'notion',
  SLACK: 'slack',
};


export const FUNCTION_NAMES = {
  CREATE_TRELLO_CARD: 'create_trello_card',
  CREATE_CALENDAR_EVENT: 'create_calendar_event',
  CREATE_NOTION_NOTE: 'create_notion_note',
  SEND_SLACK_MESSAGE: 'send_slack_message',
  GET_TODAYS_EVENTS: 'get_todays_events',
  GET_PENDING_TASKS: 'get_pending_tasks',
};


export const ACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
};


export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};


export const ERROR_MESSAGES = {
  INTERNAL_ERROR: 'An internal server error occurred',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access',
  RATE_LIMIT: 'Too many requests, please try again later',
  DEEPGRAM_ERROR: 'Voice processing error',
  INTEGRATION_ERROR: 'Integration service error',
};


export const DEEPGRAM_CONFIG = {
  VOICE_MODEL: 'aura-asteria-en',
  LISTEN_MODEL: 'nova-2',
  LANGUAGE: 'en-US',
  SAMPLE_RATE: 16000,
};

export default {
  SOCKET_EVENTS,
  VOICE_STATES,
  INTEGRATION_TYPES,
  FUNCTION_NAMES,
  ACTION_STATUS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  DEEPGRAM_CONFIG,
};