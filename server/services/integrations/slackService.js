

import axios from 'axios';
import { logger } from '../../utils/logger.js';

class SlackService {
  constructor() {
    this.botToken = process.env.SLACK_BOT_TOKEN;
    this.channelId = process.env.SLACK_CHANNEL_ID;
    this.baseUrl = 'https://slack.com/api';
  }

  
  isConfigured() {
    return !!this.botToken;
  }

  
  async getStatus() {
    if (!this.isConfigured()) {
      return {
        connected: false,
        configured: false,
        message: 'Slack bot token not configured',
      };
    }

    try {
      await this.testAuth();
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
    const { botToken, channelId } = credentials;

    this.botToken = botToken || this.botToken;
    this.channelId = channelId || this.channelId;

    
    await this.testAuth();

    logger.info('Slack connected successfully');
    return { connected: true };
  }

  
  async disconnect() {
    logger.info('Slack disconnected');
    return { connected: false };
  }

  
  async test() {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Slack not configured',
      };
    }

    try {
      const auth = await this.testAuth();
      return {
        success: true,
        message: `Connected as ${auth.user}!`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  
  async request(endpoint, method = 'GET', data = null) {
    if (!this.isConfigured()) {
      logger.warn('Slack not configured, returning mock data');
      return this.getMockData(endpoint, method, data);
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await axios({
        method,
        url,
        headers: {
          Authorization: `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined,
      });

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Slack API error');
      }

      return response.data;
    } catch (error) {
      logger.error('Slack API error', {
        endpoint,
        error: error.response?.data || error.message,
      });
      throw new Error(error.response?.data?.error || error.message || 'Slack API error');
    }
  }

  
  getMockData(endpoint, method, data) {
    if (endpoint.includes('/auth.test')) {
      return {
        ok: true,
        user: 'VoiceDesk Bot',
        team: 'Demo Team',
        user_id: 'U12345',
      };
    }

    if (endpoint.includes('/conversations.list')) {
      return {
        ok: true,
        channels: [
          { id: 'C001', name: 'general', is_channel: true },
          { id: 'C002', name: 'random', is_channel: true },
          { id: 'C003', name: 'team-updates', is_channel: true },
        ],
      };
    }

    if (endpoint.includes('/chat.postMessage')) {
      return {
        ok: true,
        channel: data?.channel || this.channelId || 'C001',
        ts: Date.now().toString(),
        message: {
          text: data?.text,
        },
      };
    }

    return { ok: true };
  }

  
  async testAuth() {
    const response = await this.request('/auth.test', 'POST');
    return {
      user: response.user,
      team: response.team,
      userId: response.user_id,
    };
  }

  
  async getChannels() {
    const response = await this.request('/conversations.list', 'GET', {
      types: 'public_channel,private_channel',
      limit: 100,
    });

    return (response.channels || []).map(channel => ({
      id: channel.id,
      name: channel.name,
      isPrivate: channel.is_private,
      memberCount: channel.num_members,
    }));
  }

  
  async sendMessage(messageData) {
    const { text, channel, blocks } = messageData;

    if (!text) {
      throw new Error('Message text is required');
    }

    const targetChannel = channel || this.channelId;
    if (!targetChannel && this.isConfigured()) {
      throw new Error('Channel ID not specified');
    }

    const data = {
      channel: targetChannel || 'mock_channel',
      text,
    };

    if (blocks) {
      data.blocks = blocks;
    }

    const result = await this.request('/chat.postMessage', 'POST', data);

    logger.info('Slack message sent', { channel: result.channel, ts: result.ts });

    return {
      channel: result.channel,
      ts: result.ts,
      success: true,
    };
  }

  
  async updateMessage(channel, ts, text) {
    return this.request('/chat.update', 'POST', {
      channel,
      ts,
      text,
    });
  }

  
  async deleteMessage(channel, ts) {
    return this.request('/chat.delete', 'POST', {
      channel,
      ts,
    });
  }

  
  async addReaction(channel, ts, emoji) {
    return this.request('/reactions.add', 'POST', {
      channel,
      timestamp: ts,
      name: emoji,
    });
  }

  
  async getUserInfo(userId) {
    const response = await this.request('/users.info', 'GET', { user: userId });
    return response.user;
  }
}


export const slackService = new SlackService();
export default slackService;