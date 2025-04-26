// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user data to request
 */
module.exports = async (req, res, next) => {
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
      profileId: user.profile
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