const Request = require('../models/Request');
const Client = require('../models/Client');
const Astrologer = require('../models/Astrologer');
const encryptionService = require('./encryptionService');

/**
 * Get request details
 */
exports.getRequestDetails = async (requestId, userId, role) => {
  const request = await Request.findById(requestId)
    .populate('assignedAstrologers', 'user')
    .populate('chatChannels');
  
  if (!request) {
    throw new Error('Request not found');
  }
  
  // Verify that user has access to this request
  let hasAccess = false;
  let profileId = null;
  
  if (role === 'client') {
    const client = await Client.findOne({ user: userId });
    profileId = client ? client._id : null;
    hasAccess = client && request.client.equals(client._id);
  } else if (role === 'astrologer') {
    const astrologer = await Astrologer.findOne({ user: userId });
    profileId = astrologer ? astrologer._id : null;
    hasAccess = astrologer && request.assignedAstrologers.some(a => a.equals(astrologer._id));
  }
  
  if (!hasAccess) {
    throw new Error('Access denied');
  }
  
  // Filter sensitive information based on role
  const responseData = {
    _id: request._id,
    title: request.title,
    status: request.status,
    createdAt: request.createdAt,
    assignedAstrologersCount: request.assignedAstrologers.length,
    maxAstrologers: request.maxAstrologers
  };
  
  // Only clients can see birth details
  if (role === 'client') {
    // Decrypt birth details
    responseData.birthDetails = {
      date: encryptionService.decrypt(request.birthDetails.date),
      time: encryptionService.decrypt(request.birthDetails.time),
      location: encryptionService.decrypt(request.birthDetails.location)
    };
  }
  
  return responseData;
};

/**
 * Close a request
 */
exports.closeRequest = async (requestId, userId) => {
  // Verify client owns this request
  const client = await Client.findOne({ user: userId });
  if (!client) {
    throw new Error('Client not found');
  }
  
  const request = await Request.findById(requestId);
  if (!request) {
    throw new Error('Request not found');
  }
  
  if (!request.client.equals(client._id)) {
    throw new Error('Access denied');
  }
  
  // Close the request
  request.status = 'closed';
  await request.save();
  
  // Update client's active request count
  client.activeRequestCount -= 1;
  await client.save();
  
  // Update astrologers' stats
  for (const astrologerId of request.assignedAstrologers) {
    await Astrologer.findByIdAndUpdate(
      astrologerId,
      { 
        $inc: { 
          activeRequestCount: -1,
          totalCompletedRequests: 1
        } 
      }
    );
  }
  
  return { success: true };
};