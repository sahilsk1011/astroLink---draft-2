const { validationResult } = require('express-validator');
const requestService = require('../services/requestService');
const { errorResponse, successResponse } = require('../utils/responseHandler');

/**
 * Get details of a specific request
 * @route GET /api/request/:requestId
 * @access Private
 */
exports.getRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;
    
    // Get request details through service
    const requestData = await requestService.getRequestDetails(requestId, userId, role);
    
    return successResponse(res, 200, 'Request details retrieved successfully', {
      request: requestData
    });
  } catch (error) {
    console.error('Get request details error:', error);
    return errorResponse(res, 
      ['Request not found', 'Access denied'].includes(error.message) 
        ? 404 
        : 500, 
      error.message
    );
  }
};

/**
 * Close a consultation request
 * @route PUT /api/request/:requestId/close
 * @access Private (Client only)
 */
exports.closeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;
    
    // Close request through service
    await requestService.closeRequest(requestId, userId);
    
    return successResponse(res, 200, 'Request closed successfully');
  } catch (error) {
    console.error('Close request error:', error);
    return errorResponse(res, 
      ['Request not found', 'Access denied'].includes(error.message) 
        ? 404 
        : 500, 
      error.message
    );
  }
};