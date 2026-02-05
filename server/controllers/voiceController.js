

import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { voiceOptions } from '../config/deepgram.config.js';
import { logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const historyPath = path.join(__dirname, '../data/history.json');

export const voiceController = {
  
  getSession: (req, res) => {
    const io = req.app.get('io');
    const connectedClients = io?.engine?.clientsCount || 0;

    successResponse(res, {
      active: connectedClients > 0,
      connectedClients,
      serverTime: new Date().toISOString(),
    }, 'Session info retrieved');
  },

  
  getVoices: (req, res) => {
    successResponse(res, voiceOptions, 'Available voices retrieved');
  },

  
  textToSpeech: async (req, res) => {
    try {
      const { text, voice = 'aura-asteria-en' } = req.body;

      if (!text) {
        return errorResponse(res, 'Text is required', 400);
      }

      
      
      logger.info('TTS request', { text, voice });

      successResponse(res, {
        text,
        voice,
        message: 'TTS would be generated here',
        
      }, 'Text-to-speech processed');
    } catch (error) {
      logger.error('TTS failed', { error: error.message });
      errorResponse(res, 'Text-to-speech failed');
    }
  },

  
  getHistory: async (req, res) => {
    try {
      const { page = 1, limit = 10, type } = req.query;

      
      let history = [];
      try {
        const data = await fs.readFile(historyPath, 'utf-8');
        history = JSON.parse(data);
      } catch {
        
        history = [];
      }

      
      if (type) {
        history = history.filter(item =>
          item.actions?.some(action => action.type.includes(type))
        );
      }

      
      history.sort((a, b) => new Date(b.date) - new Date(a.date));

      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedHistory = history.slice(startIndex, endIndex);

      successResponse(res, {
        conversations: paginatedHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: history.length,
          totalPages: Math.ceil(history.length / limit),
        },
      }, 'History retrieved');
    } catch (error) {
      logger.error('Failed to get history', { error: error.message });
      errorResponse(res, 'Failed to retrieve history');
    }
  },

  
  clearHistory: async (req, res) => {
    try {
      await fs.writeFile(historyPath, JSON.stringify([], null, 2));
      logger.info('History cleared');
      successResponse(res, null, 'History cleared successfully');
    } catch (error) {
      logger.error('Failed to clear history', { error: error.message });
      errorResponse(res, 'Failed to clear history');
    }
  },
};

export default voiceController;