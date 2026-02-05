

import slackService from '../../services/integrations/slackService.js';
import { logger } from '../../utils/logger.js';

export const messageHandler = {
  
  sendMessage: async (args) => {
    const { message, channel } = args;

    logger.info('Sending Slack message', { channel, messageLength: message.length });

    try {
      const result = await slackService.sendMessage({
        text: message,
        channel: channel || process.env.SLACK_CHANNEL_ID,
      });

      return {
        success: true,
        channel: result.channel,
        timestamp: result.ts,
        message: 'Message sent successfully',
      };
    } catch (error) {
      logger.error('Failed to send Slack message', { error: error.message });
      throw error;
    }
  },
};

export default messageHandler;