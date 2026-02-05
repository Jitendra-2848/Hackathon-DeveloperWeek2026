

import axios from 'axios';
import { logger } from '../../utils/logger.js';

class CalendarService {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  
  isConfigured() {
    return !!(this.clientId && this.clientSecret && this.refreshToken);
  }

  
  async getStatus() {
    if (!this.isConfigured()) {
      return {
        connected: false,
        configured: false,
        message: 'Google Calendar credentials not configured',
      };
    }

    try {
      await this.getAccessToken();
      return {
        connected: true,
        configured: true,
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      return {
        connected: false,
        configured: true,
        message: error.message,
      };
    }
  }

  
  async connect(credentials) {
    const { clientId, clientSecret, refreshToken } = credentials;

    this.clientId = clientId || this.clientId;
    this.clientSecret = clientSecret || this.clientSecret;
    this.refreshToken = refreshToken || this.refreshToken;

    
    await this.getAccessToken();

    logger.info('Google Calendar connected successfully');
    return { connected: true };
  }

  
  async disconnect() {
    this.accessToken = null;
    this.tokenExpiry = null;
    logger.info('Google Calendar disconnected');
    return { connected: false };
  }

  
  async test() {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Google Calendar not configured',
      };
    }

    try {
      const events = await this.getTodaysEvents();
      return {
        success: true,
        message: `Connected! Found ${events.length} events today.`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  
  async getAccessToken() {
    
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.isConfigured()) {
      throw new Error('Google Calendar not configured');
    }

    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));

      return this.accessToken;
    } catch (error) {
      logger.error('Failed to refresh Google access token', { error: error.message });
      throw new Error('Failed to authenticate with Google');
    }
  }

  
  async request(endpoint, method = 'GET', data = null) {
    if (!this.isConfigured()) {
      logger.warn('Google Calendar not configured, returning mock data');
      return this.getMockData(endpoint, method, data);
    }

    const token = await this.getAccessToken();
    const url = `https://www.googleapis.com/calendar/v3${endpoint}`;

    try {
      const response = await axios({
        method,
        url,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined,
      });

      return response.data;
    } catch (error) {
      logger.error('Google Calendar API error', {
        endpoint,
        error: error.response?.data || error.message,
      });
      throw new Error(error.response?.data?.error?.message || 'Calendar API error');
    }
  }

  
  getMockData(endpoint, method, data) {
    if (method === 'POST') {
      return {
        id: 'event_' + Date.now(),
        summary: data?.summary || 'New Event',
        start: data?.start || { dateTime: new Date().toISOString() },
        end: data?.end || { dateTime: new Date(Date.now() + 3600000).toISOString() },
        htmlLink: 'https://calendar.google.com/calendar/event?eid=example',
      };
    }

    
    const now = new Date();
    return {
      items: [
        {
          id: 'event1',
          summary: 'Team Standup',
          start: { dateTime: new Date(now.setHours(10, 0)).toISOString() },
          end: { dateTime: new Date(now.setHours(10, 30)).toISOString() },
        },
        {
          id: 'event2',
          summary: 'Lunch with John',
          start: { dateTime: new Date(now.setHours(13, 0)).toISOString() },
          end: { dateTime: new Date(now.setHours(14, 0)).toISOString() },
        },
        {
          id: 'event3',
          summary: 'Project Review',
          start: { dateTime: new Date(now.setHours(16, 0)).toISOString() },
          end: { dateTime: new Date(now.setHours(17, 0)).toISOString() },
        },
      ],
    };
  }

  
  async getEvents(date = null) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const response = await this.request(`/calendars/${this.calendarId}/events`, 'GET', {
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return (response.items || []).map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location,
      description: event.description,
    }));
  }

  
  async getTodaysEvents() {
    return this.getEvents(new Date());
  }

  
  async createEvent(eventData) {
    const { summary, description = '', location = '', start, end } = eventData;

    if (!summary) {
      throw new Error('Event summary is required');
    }

    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date(startTime.getTime() + 3600000); 

    const data = {
      summary,
      description,
      location,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const result = await this.request(`/calendars/${this.calendarId}/events`, 'POST', data);

    logger.info('Calendar event created', { eventId: result.id, summary });

    return {
      id: result.id,
      summary: result.summary,
      start: result.start,
      end: result.end,
      htmlLink: result.htmlLink,
    };
  }

  
  async updateEvent(eventId, updates) {
    return this.request(`/calendars/${this.calendarId}/events/${eventId}`, 'PUT', updates);
  }

  
  async deleteEvent(eventId) {
    return this.request(`/calendars/${this.calendarId}/events/${eventId}`, 'DELETE');
  }
}


export const calendarService = new CalendarService();
export default calendarService;