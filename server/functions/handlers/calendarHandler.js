

import calendarService from '../../services/integrations/calendarService.js';
import { logger } from '../../utils/logger.js';

export const calendarHandler = {
  
  createEvent: async (args) => {
    const { 
      title, 
      start_time, 
      end_time, 
      date = 'today',
      description = '',
      location = '',
    } = args;

    logger.info('Creating calendar event', { title, start_time, date });

    try {
      const result = await calendarService.createEvent({
        summary: title,
        description,
        location,
        start: parseDateTime(date, start_time),
        end: end_time ? parseDateTime(date, end_time) : null,
      });

      return {
        id: result.id,
        title: result.summary,
        start: result.start,
        htmlLink: result.htmlLink,
      };
    } catch (error) {
      logger.error('Failed to create calendar event', { error: error.message });
      throw error;
    }
  },

  
  getTodaysEvents: async () => {
    logger.info('Getting today\'s events');

    try {
      const events = await calendarService.getTodaysEvents();
      return events;
    } catch (error) {
      logger.error('Failed to get today\'s events', { error: error.message });
      throw error;
    }
  },
};


function parseDateTime(date, time) {
  const now = new Date();
  let targetDate = new Date();

  
  if (date === 'tomorrow') {
    targetDate.setDate(now.getDate() + 1);
  } else if (date !== 'today') {
    
    const parsed = new Date(date);
    if (!isNaN(parsed)) {
      targetDate = parsed;
    }
  }

  
  const timeMatch = time.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]) || 0;
    const period = timeMatch[3]?.toLowerCase();

    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    targetDate.setHours(hours, minutes, 0, 0);
  }

  return targetDate.toISOString();
}

export default calendarHandler;