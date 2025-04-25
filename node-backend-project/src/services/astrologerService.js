const Request = require('../models/Request');
const Astrologer = require('../models/Astrologer');
const ChatChannel = require('../models/ChatChannel');
const Client = require('../models/Client');

/**
 * Get available requests for an astrologer
 */
exports.getAvailableRequests = async (astrologerId) => {
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) {
    throw new Error('Astrologer not found');
  }

  // Find requests that:
  // 1. Are open
  // 2. Have fewer assigned astrologers than maxAstrologers
  // 3. Astrologer is not already assigned
  // 4. Astrologer is not in client's blocklist
  const requests = await Request.aggregate([
    { $match: { 
      status: 'open',
      $expr: { $lt: [{ $size: "$assignedAstrologers" }, "$maxAstrologers"] }
    }},
    { $lookup: {
      from: 'clients',
      localField: 'client',
      foreignField: '_id',
      as: 'clientData'
    }},
    { $match: {
      assignedAstrologers: { $ne: astrologerId },
      'clientData.blocklist': { $nin: [astrologerId] }
    }},
    { $project: {
      title: 1,
      createdAt: 1,
      maxAstrologers: 1,
      assignedAstrologersCount: { $size: "$assignedAstrologers" }
    }}
  ]);
  
  return requests;
};

/**
 * Accept a consultation request
 */
exports.acceptRequest = async (astrologerId, requestId) => {
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) {
    throw new Error('Astrologer not found');
  }

  // Find the request
  const request = await Request.findById(requestId);
  if (!request) {
    throw new Error('Request not found');
  }
  
  // Check if request is still open
  if (request.status === 'closed') {
    throw new Error('Request is no longer available');
  }
  
  // Check if astrologer is already assigned
  if (request.assignedAstrologers.includes(astrologerId)) {
    throw new Error('You have already accepted this request');
  }
  
  // Check if request has reached max astrologers
  if (request.assignedAstrologers.length >= request.maxAstrologers) {
    throw new Error('Request has reached maximum astrologers');
  }
  
  // Check if astrologer is blocked by client
  const client = await Client.findById(request.client);
  if (client.blocklist.includes(astrologerId)) {
    throw new Error('You cannot accept this request');
  }
  
  // Create a chat channel
  const chatChannel = new ChatChannel({
    request: requestId,
    client: request.client,
    astrologer: astrologerId,
    isActive: true,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    messages: []
  });
  
  const savedChannel = await chatChannel.save();
  
  // Update request
  request.assignedAstrologers.push(astrologerId);
  request.chatChannels.push(savedChannel._id);
  
  if (request.status === 'open' && request.assignedAstrologers.length > 0) {
    request.status = 'in-progress';
  }
  
  await request.save();
  
  // Update astrologer's active request count
  astrologer.activeRequestCount += 1;
  await astrologer.save();
  
  return {
    request,
    chatChannelId: savedChannel._id
  };
};

/**
 * Get astrologer dashboard data
 */
exports.getAstrologerDashboard = async (astrologerId) => {
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) {
    throw new Error('Astrologer not found');
  }
  
  const activeRequests = await Request.countDocuments({
    assignedAstrologers: astrologerId,
    status: 'in-progress'
  });
  
  return {
    reputation: astrologer.reputation,
    activeRequestCount: activeRequests,
    totalCompletedRequests: astrologer.totalCompletedRequests,
    paymentStatus: astrologer.paymentStatus
  };
};

/**
 * Process astrologer payment
 */
exports.processPayment = async (astrologerId, paymentData) => {
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) {
    throw new Error('Astrologer not found');
  }
  
  // In a real implementation, this would integrate with Razorpay/Stripe
  // For now, we'll just update the payment status
  
  astrologer.paymentStatus.hasPaid = true;
  astrologer.paymentStatus.lastPaymentDate = new Date();
  
  await astrologer.save();
  
  return {
    success: true,
    paymentStatus: astrologer.paymentStatus
  };
};