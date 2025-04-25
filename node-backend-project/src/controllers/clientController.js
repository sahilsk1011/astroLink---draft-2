const { validationResult } = require('express-validator');
const clientService = require('../services/clientService');
const { errorResponse, successResponse } = require('../utils/responseHandler');

/**
 * Submit a new consultation request
 * @route POST /api/client/request
 * @access Private (Client only)
 */
exports.submitRequest = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, birthDate, birthTime, birthLocation } = req.body;
    const clientId = req.user.profileId;

    // Submit request through service
    const request = await clientService.submitRequest(clientId, {
      title,
      birthDate,
      birthTime,
      birthLocation
    });

    return successResponse(res, 201, 'Consultation request submitted successfully', {
      requestId: request._id
    });
  } catch (error) {
    console.error('Submit request error:', error);
    return errorResponse(
      res, 
      error.message.includes('Maximum active request') ? 400 : 500, 
      error.message
    );
  }
};

/**
 * Get all requests for the authenticated client
 * @route GET /api/client/requests
 * @access Private (Client only)
 */
exports.getRequests = async (req, res) => {
  try {
    const clientId = req.user.profileId;
    
    // Get requests through service
    const requests = await clientService.getClientRequests(clientId);
    
    return successResponse(res, 200, 'Requests retrieved successfully', {
      requests
    });
  } catch (error) {
    console.error('Get requests error:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Block an astrologer
 * @route POST /api/client/block/:astrologerId
 * @access Private (Client only)
 */
exports.blockAstrologer = async (req, res) => {
  try {
    const { astrologerId } = req.params;
    const clientId = req.user.profileId;
    
    // Block astrologer through service
    await clientService.blockAstrologer(clientId, astrologerId);
    
    return successResponse(res, 200, 'Astrologer blocked successfully');
  } catch (error) {
    console.error('Block astrologer error:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Expand astrologer pool for a request
 * @route POST /api/client/expand-pool/:requestId
 * @access Private (Client only)
 */
exports.expandPool = async (req, res) => {
  try {
    const { requestId } = req.params;
    const clientId = req.user.profileId;
    
    // Expand pool through service
    const updatedRequest = await clientService.expandAstrologerPool(clientId, requestId);
    
    return successResponse(res, 200, 'Astrologer pool expanded successfully', {
      newLimit: updatedRequest.maxAstrologers
    });
  } catch (error) {
    console.error('Expand pool error:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get client dashboard data
 * @route GET /api/client/dashboard
 * @access Private (Client only)
 */
exports.getDashboard = async (req, res) => {
  try {
    const clientId = req.user.profileId;
    
    // Get dashboard data through service
    const dashboardData = await clientService.getClientDashboard(clientId);
    
    return successResponse(res, 200, 'Dashboard data retrieved successfully', dashboardData);
  } catch (error) {
    console.error('Get dashboard error:', error);
    return errorResponse(res, 500, error.message);
  }
};