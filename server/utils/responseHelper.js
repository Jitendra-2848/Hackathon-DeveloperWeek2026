

import { HTTP_STATUS } from './constants.js';


export const successResponse = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};


export const createdResponse = (res, data = null, message = 'Resource created successfully') => {
  return successResponse(res, data, message, HTTP_STATUS.CREATED);
};


export const errorResponse = (res, message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  
  if (process.env.NODE_ENV === 'production' && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    response.message = 'An internal server error occurred';
  }

  return res.status(statusCode).json(response);
};


export const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Validation failed', HTTP_STATUS.BAD_REQUEST, errors);
};


export const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, HTTP_STATUS.NOT_FOUND);
};


export const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return errorResponse(res, message, HTTP_STATUS.UNAUTHORIZED);
};


export const forbiddenResponse = (res, message = 'Forbidden') => {
  return errorResponse(res, message, HTTP_STATUS.FORBIDDEN);
};


export const rateLimitResponse = (res, message = 'Too many requests') => {
  return errorResponse(res, message, HTTP_STATUS.TOO_MANY_REQUESTS);
};


export const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

export default {
  successResponse,
  createdResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  rateLimitResponse,
  paginatedResponse,
};