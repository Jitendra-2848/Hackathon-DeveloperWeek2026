

import axios from 'axios';
import { logger } from '../../utils/logger.js';

class TrelloService {
  constructor() {
    this.baseUrl = 'https://api.trello.com/1';
    this.apiKey = process.env.TRELLO_API_KEY;
    this.token = process.env.TRELLO_TOKEN;
    this.boardId = process.env.TRELLO_BOARD_ID;
    this.listId = process.env.TRELLO_LIST_ID;
  }

  
  isConfigured() {
    return !!(this.apiKey && this.token);
  }

  
  async getStatus() {
    if (!this.isConfigured()) {
      return {
        connected: false,
        configured: false,
        message: 'Trello credentials not configured',
      };
    }

    try {
      await this.getBoards();
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
    const { apiKey, token, boardId, listId } = credentials;

    this.apiKey = apiKey || this.apiKey;
    this.token = token || this.token;
    this.boardId = boardId || this.boardId;
    this.listId = listId || this.listId;

    
    await this.getBoards();

    logger.info('Trello connected successfully');
    return { connected: true };
  }

  
  async disconnect() {
    
    logger.info('Trello disconnected');
    return { connected: false };
  }

  
  async test() {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Trello not configured',
      };
    }

    try {
      const boards = await this.getBoards();
      return {
        success: true,
        message: `Connected! Found ${boards.length} boards.`,
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
      
      logger.warn('Trello not configured, returning mock data');
      return this.getMockData(endpoint, method, data);
    }

    const url = `${this.baseUrl}${endpoint}`;
    const params = {
      key: this.apiKey,
      token: this.token,
    };

    try {
      const response = await axios({
        method,
        url,
        params: method === 'GET' ? { ...params, ...(data || {}) } : params,
        data: method !== 'GET' ? data : undefined,
      });

      return response.data;
    } catch (error) {
      logger.error('Trello API error', {
        endpoint,
        error: error.response?.data || error.message,
      });
      throw new Error(error.response?.data?.message || 'Trello API error');
    }
  }

  
  getMockData(endpoint, method, data) {
    if (endpoint.includes('/boards')) {
      return [
        { id: 'board1', name: 'My Tasks', url: 'https://trello.com/b/example1' },
        { id: 'board2', name: 'Project Board', url: 'https://trello.com/b/example2' },
      ];
    }

    if (endpoint.includes('/lists')) {
      return [
        { id: 'list1', name: 'To Do' },
        { id: 'list2', name: 'In Progress' },
        { id: 'list3', name: 'Done' },
      ];
    }

    if (endpoint.includes('/cards') && method === 'POST') {
      return {
        id: 'card_' + Date.now(),
        name: data?.name || 'New Task',
        url: 'https://trello.com/c/example',
        idList: this.listId || 'list1',
      };
    }

    if (endpoint.includes('/cards')) {
      return [
        { id: 'card1', name: 'Buy groceries', due: null },
        { id: 'card2', name: 'Call John', due: new Date().toISOString() },
        { id: 'card3', name: 'Review documents', due: null },
      ];
    }

    return {};
  }

  
  async getBoards() {
    return this.request('/members/me/boards');
  }

  
  async getLists(boardId) {
    const id = boardId || this.boardId;
    if (!id) {
      throw new Error('Board ID not specified');
    }
    return this.request(`/boards/${id}/lists`);
  }

  
  async getCards(limit = 10) {
    const listId = this.listId;

    if (!listId) {
      
      if (this.boardId) {
        const cards = await this.request(`/boards/${this.boardId}/cards`);
        return cards.slice(0, limit).map(card => ({
          id: card.id,
          title: card.name,
          description: card.desc,
          due: card.due,
          url: card.url,
        }));
      }
      return this.getMockData('/cards', 'GET');
    }

    const cards = await this.request(`/lists/${listId}/cards`);
    return cards.slice(0, limit).map(card => ({
      id: card.id,
      title: card.name,
      description: card.desc,
      due: card.due,
      url: card.url,
    }));
  }

  
  async createCard(cardData) {
    const { name, desc = '', due = null, labels = [] } = cardData;

    if (!name) {
      throw new Error('Card name is required');
    }

    const listId = this.listId;
    if (!listId && this.isConfigured()) {
      throw new Error('List ID not configured');
    }

    const data = {
      name,
      desc,
      due,
      idList: listId || 'mock_list',
      idLabels: labels.join(','),
    };

    const result = await this.request('/cards', 'POST', data);

    logger.info('Trello card created', { cardId: result.id, name });

    return {
      id: result.id,
      name: result.name,
      url: result.url || result.shortUrl,
    };
  }

  
  async updateCard(cardId, updates) {
    return this.request(`/cards/${cardId}`, 'PUT', updates);
  }

  
  async deleteCard(cardId) {
    return this.request(`/cards/${cardId}`, 'DELETE');
  }

  
  async moveCard(cardId, listId) {
    return this.request(`/cards/${cardId}`, 'PUT', { idList: listId });
  }
}


export const trelloService = new TrelloService();
export default trelloService;