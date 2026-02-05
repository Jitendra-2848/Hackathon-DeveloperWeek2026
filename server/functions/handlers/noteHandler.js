

import notionService from '../../services/integrations/notionService.js';
import { logger } from '../../utils/logger.js';

export const noteHandler = {
  
  createNote: async (args) => {
    const { title, content = '', tags = [] } = args;

    logger.info('Creating Notion note', { title, tags });

    try {
      const result = await notionService.createPage({
        title,
        content,
        tags,
      });

      return {
        id: result.id,
        title,
        url: result.url,
        created: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to create Notion note', { error: error.message });
      throw error;
    }
  },
};

export default noteHandler;