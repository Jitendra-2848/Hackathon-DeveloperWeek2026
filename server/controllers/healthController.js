

import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { logger } from '../utils/logger.js';


const startTime = Date.now();

export const healthController = {
  
  check: (req, res) => {
    successResponse(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }, 'Server is healthy');
  },

  
  detailed: async (req, res) => {
    try {
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      const memoryUsage = process.memoryUsage();

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: {
          seconds: uptime,
          formatted: formatUptime(uptime),
        },
        memory: {
          heapUsed: formatBytes(memoryUsage.heapUsed),
          heapTotal: formatBytes(memoryUsage.heapTotal),
          rss: formatBytes(memoryUsage.rss),
          external: formatBytes(memoryUsage.external),
        },
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        services: {
          deepgram: checkDeepgramConnection(),
          trello: checkTrelloConnection(),
          calendar: checkCalendarConnection(),
          notion: checkNotionConnection(),
          slack: checkSlackConnection(),
        },
      };

      successResponse(res, health, 'Detailed health check completed');
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      errorResponse(res, 'Health check failed');
    }
  },

  
  ready: (req, res) => {
    
    const isReady = !!process.env.DEEPGRAM_API_KEY;

    if (isReady) {
      successResponse(res, { ready: true }, 'Server is ready');
    } else {
      res.status(503).json({
        success: false,
        ready: false,
        message: 'Server is not ready',
      });
    }
  },

  
  live: (req, res) => {
    successResponse(res, { live: true }, 'Server is alive');
  },
};


function formatBytes(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

function checkDeepgramConnection() {
  return {
    configured: !!process.env.DEEPGRAM_API_KEY,
    status: process.env.DEEPGRAM_API_KEY ? 'connected' : 'not_configured',
  };
}

function checkTrelloConnection() {
  return {
    configured: !!(process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN),
    status: (process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN) ? 'connected' : 'not_configured',
  };
}

function checkCalendarConnection() {
  return {
    configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    status: (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ? 'connected' : 'not_configured',
  };
}

function checkNotionConnection() {
  return {
    configured: !!process.env.NOTION_API_KEY,
    status: process.env.NOTION_API_KEY ? 'connected' : 'not_configured',
  };
}

function checkSlackConnection() {
  return {
    configured: !!process.env.SLACK_BOT_TOKEN,
    status: process.env.SLACK_BOT_TOKEN ? 'connected' : 'not_configured',
  };
}

export default healthController;