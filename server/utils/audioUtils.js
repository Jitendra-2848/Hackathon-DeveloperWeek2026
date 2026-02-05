


export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};


export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};


export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};


export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') 
    .slice(0, 5000); 
};


export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};


export const validateApiKey = (key) => {
  return typeof key === 'string' && key.length >= 20;
};


export const validateIntegrationConfig = (type, config) => {
  const requiredFields = {
    trello: ['apiKey', 'token'],
    calendar: ['clientId', 'clientSecret'],
    notion: ['apiKey', 'databaseId'],
    slack: ['botToken'],
  };

  const required = requiredFields[type] || [];
  const missing = required.filter(field => !config[field]);

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missing.join(', ')}`,
    };
  }

  return { valid: true };
};


export const validateFunctionParams = (functionName, params) => {
  const requiredParams = {
    create_trello_card: ['title'],
    create_calendar_event: ['title', 'start_time'],
    create_notion_note: ['title'],
    send_slack_message: ['message'],
    get_todays_events: [],
    get_pending_tasks: [],
  };

  const required = requiredParams[functionName] || [];
  const missing = required.filter(param => !params[param]);

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required parameters: ${missing.join(', ')}`,
    };
  }

  return { valid: true };
};

export default {
  validateRequired,
  validateEmail,
  validateUrl,
  validateDate,
  sanitizeString,
  sanitizeObject,
  validateApiKey,
  validateIntegrationConfig,
  validateFunctionParams,
};