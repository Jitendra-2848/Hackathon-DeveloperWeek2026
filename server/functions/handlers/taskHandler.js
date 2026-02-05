

import trelloService from '../../services/integrations/trelloService.js';
import { logger } from '../../utils/logger.js';

export const taskHandler = {
  
  createCard: async (args) => {
    const { title, description = '', due_date, priority = 'medium' } = args;

    logger.info('Creating Trello card', { title, priority });

    try {
      const result = await trelloService.createCard({
        name: title,
        desc: description,
        due: due_date,
        labels: priority === 'high' ? ['urgent'] : [],
      });

      return {
        id: result.id,
        title: result.name,
        url: result.url,
        priority,
      };
    } catch (error) {
      logger.error('Failed to create Trello card', { error: error.message });
      throw error;
    }
  },

  
  getPendingTasks: async (args) => {
    const { limit = 10 } = args;

    logger.info('Getting pending tasks', { limit });

    try {
      const tasks = await trelloService.getCards(limit);
      return tasks;
    } catch (error) {
      logger.error('Failed to get pending tasks', { error: error.message });
      throw error;
    }
  },
};

export default taskHandler;