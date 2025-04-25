const Request = require('../models/Request');
const Client = require('../models/Client');
const Astrologer = require('../models/Astrologer');
const encryptionService = require('./encryptionService');

/**
 * Submit a new consultation request
 */
exports.submitRequest = async (clientId, requestData) => {
  const { title, birthDate, birthTime, birthLocation } = requestData;

  // Check if client has reached maximum active requests (3)
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error('Client not found');
  }

  if (client.activeRequestCount >= 3) {
    throw new Error('Maximum active request limit reached (3)');
  }

  // Encrypt sensitive birth details
  const encryptedBirthDetails = {
    date: encryptionService.encrypt(birthDate),
    time: encryptionService.encrypt(birthTime),
    location: encryptionService.encrypt(birthLocation)
  };

  // Create new request
  const newRequest = new Request({
    client: clientId,
    title,
    birthDetails: encryptedBirthDetails,
    status: 'open',
    createdAt: new Date(),
    maxAstrologers: 3,
    assignedAstrologers: [],
    chatChannels: []
  });

  const savedRequest = await newRequest.save();

  // Update client's active request count
  client.activeRequestCount += 1;
  await client.save();

  return savedRequest;
};

/**
 * Get all requests for a client
 */
exports.getClientRequests = async (clientId) => {
  const requests = await Request.find({ client: clientId })
    .select('title status createdAt assignedAstrologers')
    .sort({ createdAt: -1 });
  
  return requests;
};

/**
 * Block an astrologer
 */
exports.blockAstrologer = async (clientId, astrologerId) => {
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error('Client not found');
  }

  // Check if astrologer exists
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) {
    throw new Error('Astrologer not found');
  }

  // Add to blocklist if not already blocked
  if (!client.blocklist.includes(astrologerId)) {
    client.blocklist.push(astrologerId);
    await client.save();
  }

  return { success: true };
};

/**
 * Expand the astrologer pool for a request
 */
exports.expandAstrologerPool = async (clientId, requestId) => {
  const request = await Request.findOne({ 
    _id: requestId,
    client: clientId
  });
  
  if (!request) {
    throw new Error('Request not found or not authorized');
  }
  
  // Increase max astrologers limit
  request.maxAstrologers += 3;
  await request.save();
  
  return request;
};

/**
 * Get client dashboard data
 */
exports.getClientDashboard = async (clientId) => {
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error('Client not found');
  }
  
  const activeRequests = await Request.countDocuments({
    client: clientId,
    status: { $in: ['open', 'in-progress'] }
  });
  
  const completedRequests = await Request.countDocuments({
    client: clientId,
    status: 'closed'
  });
  
  return {
    activeRequestCount: activeRequests,
    completedRequestCount: completedRequests,
    maxActiveRequests: 3,
    hasPaid: client.paymentDetails.hasPaid
  };
};