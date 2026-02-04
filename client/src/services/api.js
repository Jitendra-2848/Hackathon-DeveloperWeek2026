import { API_URL } from '../utils/constants';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }

  // Get integration status
  async getIntegrationStatus() {
    return this.request('/api/integrations/status');
  }

  // Connect integration
  async connectIntegration(type, config) {
    return this.request(`/api/integrations/${type}/connect`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // Disconnect integration
  async disconnectIntegration(type) {
    return this.request(`/api/integrations/${type}/disconnect`, {
      method: 'POST',
    });
  }

  // Get conversation history
  async getHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/history?${query}`);
  }

  // Get usage stats
  async getStats() {
    return this.request('/api/stats');
  }

  // Save settings
  async saveSettings(settings) {
    return this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Get settings
  async getSettings() {
    return this.request('/api/settings');
  }
}

export const api = new ApiService();
export default api;