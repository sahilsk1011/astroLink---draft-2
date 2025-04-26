// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user data to request
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Authentication required. No token provided.' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'User not found or token invalid.' 
      });
    }
    
    // Attach user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      profileId: user.profile,
      handle: decoded.handle || ''
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Token expired. Please log in again.' 
      });
    }
    
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error during authentication.' 
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role
 * @param {string|string[]} roles - Required role(s)
 */
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Authentication required.' 
      });
    }
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    
    next();
  };
};