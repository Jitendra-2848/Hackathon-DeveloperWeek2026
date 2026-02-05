

import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { logger } from '../utils/logger.js';
import trelloService from '../services/integrations/trelloService.js';
import calendarService from '../services/integrations/calendarService.js';
import notionService from '../services/integrations/notionService.js';
import slackService from '../services/integrations/slackService.js';

export const integrationController = {
  
  getStatus: async (req, res) => {
    try {
      const status = {
        trello: await trelloService.getStatus(),
        calendar: await calendarService.getStatus(),
        notion: await notionService.getStatus(),
        slack: await slackService.getStatus(),
      };

      successResponse(res, status, 'Integration status retrieved');
    } catch (error) {
      logger.error('Failed to get integration status', { error: error.message });
      errorResponse(res, 'Failed to get integration status');
    }
  },

  
  getTrelloStatus: async (req, res) => {
    try {
      const status = await trelloService.getStatus();
      successResponse(res, status, 'Trello status retrieved');
    } catch (error) {
      errorResponse(res, 'Failed to get Trello status');
    }
  },

  connectTrello: async (req, res) => {
    try {
      const { apiKey, token, boardId, listId } = req.body;
      await trelloService.connect({ apiKey, token, boardId, listId });
      successResponse(res, { connected: true }, 'Trello connected successfully');
    } catch (error) {
      logger.error('Failed to connect Trello', { error: error.message });
      errorResponse(res, error.message || 'Failed to connect Trello');
    }
  },

  disconnectTrello: async (req, res) => {
    try {
      await trelloService.disconnect();
      successResponse(res, { connected: false }, 'Trello disconnected');
    } catch (error) {
      errorResponse(res, 'Failed to disconnect Trello');
    }
  },

  getTrelloBoards: async (req, res) => {
    try {
      const boards = await trelloService.getBoards();
      successResponse(res, boards, 'Trello boards retrieved');
    } catch (error) {
      errorResponse(res, 'Failed to get Trello boards');
    }
  },

  getTrelloLists: async (req, res) => {
    try {
      const { boardId } = req.params;
      const lists = await trelloService.getLists(boardId);
      successResponse(res, lists, 'Trello lists retrieved');
    } catch (error) {
      errorResponse(res, 'Failed to get Trello lists');
    }
  },

  
  getCalendarStatus: async (req, res) => {
    try {
      const status = await calendarService.getStatus();
      successResponse(res, status, 'Calendar status retrieved');
    } catch (error) {
      errorResponse(res, 'Failed to get Calendar status');
    }
  },

  connectCalendar: async (req, res) => {
    try {
      const { clientId, clientSecret, refreshToken } = req.body;
      await calendarService.connect({ clientId, clientSecret, refreshToken });
      successResponse(res, { connected: true }, 'Calendar connected successfully');
    } catch (error) {
      logger.error('Failed to connect Calendar', { error: error.message });
      errorResponse(res, error.message || 'Failed to connect Calendar');
    }
  },

  disconnectCalendar: async (req, res) => {
    try {
      await calendarService.disconnect();
      successResponse(res, { connected: false }, 'Calendar disconnected');
    } catch (error) {
      errorResponse(res, 'Failed to disconnect Calendar');
    }
  },

  getCalendarEvents: async (req, res) => {
    try {
      const { date } = req.query;
      const events = await calendarService.getEvents(date);
      successResponse(res, events, 'Calendar events retrieved');
    } catch (error) {
      errorResponse(res, 'Failed to get Calendar events');
    }
  },

  
  getNotionStatus: async (req, res) => {
    try {
      const status = await notionService.getStatus();
      successResponse(res, status, 'Notion status retrieved');
    } catch (error) {
      errorResponse(res, 'Failed to get Notion status');
    }
  },

  connectNotion: async (req, res) => {
    try {
      const { apiKey, databaseId } = req.body;
      await notionService.connect({ apiKey, databaseId });
      successResponse(res, { connected: true }, 'Notion connected successfully');
    } catch (error) {
      logger.error('Failed to connect Notion', { error: error.message });
      errorResponse(res, error.message || 'Failed to connect Notion');
    }
  },

  disconnectNotion: async (req, res) => {
    try {
      await notionService.disconnect();
      successResponse(res, { connected: false }, 'Notion disconnected');
    } catch (error) {
      errorResponse(res, 'Failed to disconnect Notion');
    }
  },

  getNotionDatabases: async (req, res) => {
    try {
      const databases = await notionService.getDatabases();
      successResponse(res, databases, 'Notion databases retrieved');
    } catch (error) {
      errorResponse(res, 'Failed to get Notion databases');
    }
  },

  
  getSlackStatus: async (req, res) => {
    try {
      const status = await slackService.getStatus();
      successResponse(res, status, 'Slack status retrieved');
    } catch (error) {
      errorResponse(res, 'Failed to get Slack status');
    }
  },

  connectSlack: async (req, res) => {
    try {
      const { botToken, channelId } = req.body;
      await slackService.connect({ botToken, channelId });
      successResponse(res, { connected: true }, 'Slack connected successfully');
    } catch (error) {
      logger.error('Failed to connect Slack', { error: error.message });
      errorResponse(res, error.message || 'Failed to connect Slack');
    }
  },

  disconnectSlack: async (req, res) => {
    try {
      await slackService.disconnect();
      successResponse(res, { connected: false }, 'Slack disconnected');
    } catch (error) {
      errorResponse(res, 'Failed to disconnect Slack');
    }
  },

  getSlackChannels: async (req, res) => {
    try {
      const channels = await slackService.getChannels();
      successResponse(res, channels, 'Slack channels retrieved');
    } catch (error) {
      errorResponse(res, 'Failed to get Slack channels');
    }
  },

  
  testIntegration: async (req, res) => {
    try {
      const { type } = req.params;
      let result;

      switch (type) {
        case 'trello':
          result = await trelloService.test();
          break;
        case 'calendar':
          result = await calendarService.test();
          break;
        case 'notion':
          result = await notionService.test();
          break;
        case 'slack':
          result = await slackService.test();
          break;
        default:
          return errorResponse(res, 'Unknown integration type', 400);
      }

      successResponse(res, result, 'Integration test completed');
    } catch (error) {
      logger.error('Integration test failed', { error: error.message });
      errorResponse(res, error.message || 'Integration test failed');
    }
  },
};

export default integrationController;