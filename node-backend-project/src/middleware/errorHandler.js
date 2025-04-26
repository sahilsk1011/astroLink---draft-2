// src/middleware/errorHandler.js
const { validationResult } = require('express-validator');

/**
 * Global error handling middleware
 */
module.exports = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle validation errors
  if (err.array && typeof err.array === 'function') {
    const errors = err.array();
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.map(e => ({ field: e.param, message: e.msg }))
    });
  }
  
  // Handle file upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed: ' + err.message
    });
  }
  
  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Duplicate key error. This record already exists.'
      });
    }
  }
  
  // Default error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
};