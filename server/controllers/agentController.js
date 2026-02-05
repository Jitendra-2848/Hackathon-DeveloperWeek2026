

import { logger } from '../utils/logger.js';

export const agentController = {
  
  processResponse: async (response) => {
    logger.debug('Processing agent response', { response });
    return response;
  },

  
  handleError: (error) => {
    logger.error('Agent error', { error: error.message });
    return {
      success: false,
      error: error.message,
    };
  },
};

export default agentController;