

import { logger } from '../utils/logger.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants.js';


export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}


export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Cannot ${req.method} ${req.originalUrl}`,
    HTTP_STATUS.NOT_FOUND
  );
  next(error);
};


export const errorHandler = (err, req, res, next) => {
  
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  
  logger.error('Error occurred', {
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
  }

  
  if (err.isOperational) {
    
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors,
      timestamp: new Date().toISOString(),
    });
  }

  
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    status: 'error',
    message: ERROR_MESSAGES.INTERNAL_ERROR,
    timestamp: new Date().toISOString(),
  });
};


export const handleSpecificErrors = (err) => {
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, errors);
  }

  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return new AppError('Invalid JSON', HTTP_STATUS.BAD_REQUEST);
  }

  
  if (err.code === 11000) {
    return new AppError('Duplicate entry', HTTP_STATUS.CONFLICT);
  }

  return err;
};

export default errorHandler;