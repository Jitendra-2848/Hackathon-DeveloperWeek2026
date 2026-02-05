

import { taskHandler } from './handlers/taskHandler.js';
import { calendarHandler } from './handlers/calendarHandler.js';
import { noteHandler } from './handlers/noteHandler.js';
import { messageHandler } from './handlers/messageHandler.js';
import { logger } from '../utils/logger.js';


const handlers = {
  
  create_trello_card: taskHandler.createCard,
  get_pending_tasks: taskHandler.getPendingTasks,

  
  create_calendar_event: calendarHandler.createEvent,
  get_todays_events: calendarHandler.getTodaysEvents,

  
  create_notion_note: noteHandler.createNote,

  
  send_slack_message: messageHandler.sendMessage,
};

export const functionRegistry = {
  
  execute: async (functionName, args) => {
    logger.info('Executing function', { functionName, args });

    const handler = handlers[functionName];

    if (!handler) {
      logger.error('Unknown function', { functionName });
      return {
        success: false,
        error: `Unknown function: ${functionName}`,
      };
    }

    try {
      const result = await handler(args);
      logger.info('Function executed successfully', { functionName, result });
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error('Function execution failed', { functionName, error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  },

  
  getAvailableFunctions: () => {
    return Object.keys(handlers);
  },

  
  hasFunction: (functionName) => {
    return !!handlers[functionName];
  },
};

export default functionRegistry;