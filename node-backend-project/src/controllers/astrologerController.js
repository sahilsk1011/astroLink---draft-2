const { validationResult } = require('express-validator');
const astrologerService = require('../services/astrologerService');
const { errorResponse, successResponse } = require('../utils/responseHandler');

/**
 * Get available requests for the authenticated astrologer
 * @route GET /api/astrologer/requests
 * @access Private (Astrologer only)
 */
exports.getAvailableRequests = async (req, res) => {
  try {
    const astrologerId = req.user.profileId;
    
    // Get available requests through service
    const requests = await astrologerService.getAvailableRequests(astrologerId);
    
    return successResponse(res, 200, 'Available requests retrieved successfully', {
      requests
    });
  } catch (error) {
    console.error('Get available requests error:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Accept a consultation request
 * @route POST /api/astrologer/accept/:requestId
 * @access Private (Astrologer only)
 */
exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const astrologerId = req.user.profileId;
    
    // Accept request through service
    const result = await astrologerService.acceptRequest(astrologerId, requestId);
    
    return successResponse(res, 200, 'Request accepted successfully', {
      chatChannelId: result.chatChannelId
    });
  } catch (error) {
    console.error('Accept request error:', error);
    return errorResponse(res, 
      ['Request not found', 'Request is no longer available', 'Request has reached maximum astrologers'].includes(error.message) 
        ? 400 
        : 500, 
      error.message
    );
  }
};

/**
 * Get astrologer dashboard data
 * @route GET /api/astrologer/dashboard
 * @access Private (Astrologer only)
 */
exports.getDashboard = async (req, res) => {
  try {
    const astrologerId = req.user.profileId;
    
    // Get dashboard data through service
    const dashboardData = await astrologerService.getAstrologerDashboard(astrologerId);
    
    return successResponse(res, 200, 'Dashboard data retrieved successfully', dashboardData);
  } catch (error) {
    console.error('Get dashboard error:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Process payment to unlock more requests
 * @route POST /api/astrologer/payment
 * @access Private (Astrologer only)
 */
exports.makePayment = async (req, res) => {
  try {
    const astrologerId = req.user.profileId;
    
    // Process payment through service
    // In a real implementation, this would include payment gateway data
    const result = await astrologerService.processPayment(astrologerId, req.body);
    
    return successResponse(res, 200, 'Payment successful', {
      paymentStatus: result.paymentStatus
    });
  } catch (error) {
    console.error('Make payment error:', error);
    return errorResponse(res, 500, error.message);
  }
};