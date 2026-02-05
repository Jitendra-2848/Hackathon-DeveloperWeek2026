

import axios from 'axios';
import { logger } from '../../utils/logger.js';

class NotionService {
  constructor() {
    this.apiKey = process.env.NOTION_API_KEY;
    this.databaseId = process.env.NOTION_DATABASE_ID;
    this.baseUrl = 'https://api.notion.com/v1';
    this.version = '2022-06-28';
  }

  
  isConfigured() {
    return !!this.apiKey;
  }

  
  async getStatus() {
    if (!this.isConfigured()) {
      return {
        connected: false,
        configured: false,
        message: 'Notion API key not configured',
      };
    }

    try {
      await this.getDatabases();
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
    const { apiKey, databaseId } = credentials;

    this.apiKey = apiKey || this.apiKey;
    this.databaseId = databaseId || this.databaseId;

    
    await this.getDatabases();

    logger.info('Notion connected successfully');
    return { connected: true };
  }

  
  async disconnect() {
    logger.info('Notion disconnected');
    return { connected: false };
  }

  
  async test() {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Notion not configured',
      };
    }

    try {
      const databases = await this.getDatabases();
      return {
        success: true,
        message: `Connected! Found ${databases.length} accessible databases.`,
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
      logger.warn('Notion not configured, returning mock data');
      return this.getMockData(endpoint, method, data);
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await axios({
        method,
        url,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': this.version,
        },
        data: method !== 'GET' ? data : undefined,
      });

      return response.data;
    } catch (error) {
      logger.error('Notion API error', {
        endpoint,
        error: error.response?.data || error.message,
      });
      throw new Error(error.response?.data?.message || 'Notion API error');
    }
  }

  
  getMockData(endpoint, method, data) {
    if (endpoint.includes('/search')) {
      return {
        results: [
          { id: 'db1', title: [{ plain_text: 'Notes Database' }], object: 'database' },
          { id: 'db2', title: [{ plain_text: 'Tasks Database' }], object: 'database' },
        ],
      };
    }

    if (endpoint.includes('/pages') && method === 'POST') {
      return {
        id: 'page_' + Date.now(),
        url: 'https://notion.so/page/example',
        created_time: new Date().toISOString(),
      };
    }

    return {};
  }

  
  async getDatabases() {
    const response = await this.request('/search', 'POST', {
      filter: {
        property: 'object',
        value: 'database',
      },
    });

    return (response.results || []).map(db => ({
      id: db.id,
      title: db.title?.[0]?.plain_text || 'Untitled',
    }));
  }

  
  async createPage(pageData) {
    const { title, content = '', tags = [] } = pageData;

    if (!title) {
      throw new Error('Page title is required');
    }

    
    const children = [];

    if (content) {
      children.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: content,
              },
            },
          ],
        },
      });
    }

    const data = {
      parent: this.databaseId
        ? { database_id: this.databaseId }
        : { page_id: 'root' },
      properties: {
        title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
      },
      children,
    };

    
    if (tags.length > 0 && this.databaseId) {
      data.properties.Tags = {
        multi_select: tags.map(tag => ({ name: tag })),
      };
    }

    const result = await this.request('/pages', 'POST', data);

    logger.info('Notion page created', { pageId: result.id, title });

    return {
      id: result.id,
      url: result.url,
      title,
      created: result.created_time,
    };
  }

  
  async updatePage(pageId, properties) {
    return this.request(`/pages/${pageId}`, 'PATCH', { properties });
  }

  
  async getPage(pageId) {
    return this.request(`/pages/${pageId}`, 'GET');
  }

  
  async searchPages(query) {
    const response = await this.request('/search', 'POST', {
      query,
      filter: {
        property: 'object',
        value: 'page',
      },
    });

    return response.results || [];
  }
}


export const notionService = new NotionService();
export default notionService;