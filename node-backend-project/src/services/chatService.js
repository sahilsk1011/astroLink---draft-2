const ChatChannel = require('../models/ChatChannel');
const Request = require('../models/Request');
const Client = require('../models/Client');
const Astrologer = require('../models/Astrologer');
const encryptionService = require('./encryptionService');

/**
 * Get chat history
 */
exports.getChatHistory = async (channelId, userId, role) => {
  const chatChannel = await ChatChannel.findById(channelId);
  
  if (!chatChannel) {
    throw new Error('Chat channel not found');
  }
  
  // Verify user has access to this chat
  let hasAccess = false;
  
  if (role === 'client') {
    const client = await Client.findOne({ user: userId });
    hasAccess = client && chatChannel.client.equals(client._id);
  } else if (role === 'astrologer') {
    const astrologer = await Astrologer.findOne({ user: userId });
    hasAccess = astrologer && chatChannel.astrologer.equals(astrologer._id);
  }
  
  if (!hasAccess) {
    throw new Error('Access denied');
  }
  
  // Decrypt messages
  const decryptedMessages = chatChannel.messages.map(msg => ({
    ...msg.toObject(),
    content: encryptionService.decrypt(msg.content)
  }));
  
  return {
    channelId: chatChannel._id,
    requestId: chatChannel.request,
    isActive: chatChannel.isActive,
    expiresAt: chatChannel.expiresAt,
    messages: decryptedMessages
  };
};

/**
 * Send a message
 */
exports.sendMessage = async (channelId, userId, role, messageData) => {
  const { content, contentType = 'text' } = messageData;
  
  const chatChannel = await ChatChannel.findById(channelId);
  
  if (!chatChannel) {
    throw new Error('Chat channel not found');
  }
  
  if (!chatChannel.isActive) {
    throw new Error('Chat channel is no longer active');
  }
  
  // Verify user has access to this chat
  let hasAccess = false;
  
  if (role === 'client') {
    const client = await Client.findOne({ user: userId });
    hasAccess = client && chatChannel.client.equals(client._id);
  } else if (role === 'astrologer') {
    const astrologer = await Astrologer.findOne({ user: userId });
    hasAccess = astrologer && chatChannel.astrologer.equals(astrologer._id);
  }
  
  if (!hasAccess) {
    throw new Error('Access denied');
  }
  
  // Encrypt message content
  const encryptedContent = encryptionService.encrypt(content);
  
  // Add message to chat
  chatChannel.messages.push({
    sender: role,
    content: encryptedContent,
    contentType,
    timestamp: new Date()
  });
  
  await chatChannel.save();
  
  return {
    success: true,
    timestamp: new Date()
  };
};

/**
 * Upload a file
 */
exports.uploadFile = async (channelId, userId, role, file) => {
  const chatChannel = await ChatChannel.findById(channelId);
  
  if (!chatChannel) {
    throw new Error('Chat channel not found');
  }
  
  if (!chatChannel.isActive) {
    throw new Error('Chat channel is no longer active');
  }
  
  // Verify user has access to this chat
  let hasAccess = false;
  
  if (role === 'client') {
    const client = await Client.findOne({ user: userId });
    hasAccess = client && chatChannel.client.equals(client._id);
  } else if (role === 'astrologer') {
    const astrologer = await Astrologer.findOne({ user: userId });
    hasAccess = astrologer && chatChannel.astrologer.equals(astrologer._id);
  }
  
  if (!hasAccess) {
    throw new Error('Access denied');
  }
  
  // In a real implementation, we would:
  // 1. Upload the file to cloud storage
  // 2. Get the file URL
  // 3. Store the URL in the message
  const fileUrl = `https://example.com/files/${file.filename}`;
  
  // Determine content type based on file mimetype
  const contentType = file.mimetype.startsWith('image/') ? 'image' : 'file';
  
  // Add file message to chat
  chatChannel.messages.push({
    sender: role,
    content: encryptionService.encrypt(fileUrl),
    contentType,
    fileUrl,
    timestamp: new Date()
  });
  
  await chatChannel.save();
  
  return {
    fileUrl,
    contentType,
    timestamp: new Date()
  };
};

/**
 * Rate an astrologer
 */
exports.rateAstrologer = async (channelId, userId, rating) => {
  // Verify user is a client
  const client = await Client.findOne({ user: userId });
  if (!client) {
    throw new Error('Client not found');
  }
  
  const chatChannel = await ChatChannel.findById(channelId);
  if (!chatChannel) {
    throw new Error('Chat channel not found');
  }
  
  // Verify client owns this chat
  if (!chatChannel.client.equals(client._id)) {
    throw new Error('Access denied');
  }
  
  // Calculate reputation change
  const reputationChange = rating === 'upvote' ? 1 : -1;
  
  // Update astrologer's reputation
  await Astrologer.findByIdAndUpdate(
    chatChannel.astrologer,
    { $inc: { reputation: reputationChange } }
  );
  
  return { success: true };
};