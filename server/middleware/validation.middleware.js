

import { AppError } from './errorHandler.middleware.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { sanitizeObject } from '../utils/validators.js';


export const validateBody = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      
      if (value === undefined || value === null) continue;

      
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be a ${rules.type}`);
      }

      
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }

      
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }

      
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
    }

    if (errors.length > 0) {
      return next(new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, errors));
    }

    
    req.body = sanitizeObject(req.body);

    next();
  };
};


export const validateParams = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [param, rules] of Object.entries(schema)) {
      const value = req.params[param];

      if (rules.required && !value) {
        errors.push(`Parameter ${param} is required`);
      }

      if (rules.pattern && value && !rules.pattern.test(value)) {
        errors.push(`Parameter ${param} format is invalid`);
      }
    }

    if (errors.length > 0) {
      return next(new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, errors));
    }

    next();
  };
};


export const validateQuery = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [param, rules] of Object.entries(schema)) {
      const value = req.query[param];

      if (rules.required && !value) {
        errors.push(`Query parameter ${param} is required`);
      }

      if (rules.type === 'number' && value && isNaN(Number(value))) {
        errors.push(`Query parameter ${param} must be a number`);
      }
    }

    if (errors.length > 0) {
      return next(new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, errors));
    }

    next();
  };
};

export default { validateBody, validateParams, validateQuery };