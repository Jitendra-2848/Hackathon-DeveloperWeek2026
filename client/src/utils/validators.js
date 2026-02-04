/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate API key format (basic check)
 */
export function isValidApiKey(key) {
  return typeof key === 'string' && key.length >= 20;
}

/**
 * Validate required fields
 */
export function validateRequired(value) {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Validate message content
 */
export function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' };
  }
  if (message.length > 5000) {
    return { valid: false, error: 'Message is too long' };
  }
  return { valid: true, error: null };
}

/**
 * Validate date format
 */
export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate integration config
 */
export function validateIntegrationConfig(type, config) {
  const requiredFields = {
    trello: ['apiKey', 'token', 'boardId'],
    calendar: ['clientId', 'clientSecret'],
    notion: ['apiKey', 'databaseId'],
    slack: ['botToken', 'channelId'],
  };

  const required = requiredFields[type] || [];
  const missing = required.filter((field) => !config[field]);

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missing.join(', ')}`,
    };
  }

  return { valid: true, error: null };
}