// src/utils/responseHandler.js

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object} data - Response data
 */
exports.successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    status: 'success',
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} errors - Validation errors
 */
exports.errorResponse = (res, statusCode = 400, message = 'Error', errors = null) => {
  const response = {
    status: 'error',
    message
  };
  
  if (errors !== null) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};