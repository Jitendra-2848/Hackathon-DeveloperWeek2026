

import { Router } from 'express';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { logger } from '../utils/logger.js';

const router = Router();


let settings = {
  voice: {
    speed: 1.0,
    type: 'aura-asteria-en',
  },
  notifications: true,
  soundEffects: true,
  autoListen: false,
  theme: 'dark',
};


router.get('/', (req, res) => {
  successResponse(res, settings, 'Settings retrieved successfully');
});


router.put('/', (req, res) => {
  try {
    const updates = req.body;
    
    
    settings = {
      ...settings,
      ...updates,
      voice: {
        ...settings.voice,
        ...(updates.voice || {}),
      },
    };

    logger.info('Settings updated', { settings });
    successResponse(res, settings, 'Settings updated successfully');
  } catch (error) {
    logger.error('Failed to update settings', { error: error.message });
    errorResponse(res, 'Failed to update settings');
  }
});


router.post('/reset', (req, res) => {
  settings = {
    voice: {
      speed: 1.0,
      type: 'aura-asteria-en',
    },
    notifications: true,
    soundEffects: true,
    autoListen: false,
    theme: 'dark',
  };

  logger.info('Settings reset to defaults');
  successResponse(res, settings, 'Settings reset successfully');
});


router.get('/stats', (req, res) => {
  
  const stats = {
    totalCommands: 127,
    tasksCreated: 45,
    eventsScheduled: 23,
    messagesSent: 18,
    notesCreated: 12,
    lastUsed: new Date().toISOString(),
  };

  successResponse(res, stats, 'Stats retrieved successfully');
});

export default router;