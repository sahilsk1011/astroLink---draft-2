// backend/src/controllers/chatController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const ChatChannel = require('../models/ChatChannel.js');
const encryptionService = require('../services/encryptionService.js');
const { errorResponse, successResponse } = require('../utils/responseHandler.js');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const channel = await ChatChannel.findById(channelId)
      .populate('client', 'handle')
      .populate('astrologer', 'handle');

    if (!channel) {
      return errorResponse(res, 404, 'Chat channel not found');
    }

    // Check if user has access to this channel
    const isClient = channel.client && channel.client._id.toString() === req.user.profileId;
    const isAstrologer = channel.astrologer && channel.astrologer._id.toString() === req.user.profileId;

    if (!isClient && !isAstrologer) {
      return errorResponse(res, 403, 'Access denied to this channel');
    }

    // Decrypt messages
    const decryptedMessages = channel.messages.map(msg => ({
      _id: msg._id,
      sender: msg.sender,
      senderHandle: msg.sender === 'client' ? channel.client.handle : channel.astrologer.handle,
      content: encryptionService.decrypt(msg.content),
      contentType: msg.contentType,
      timestamp: msg.timestamp,
      fileUrl: msg.fileUrl || null
    }));

    return successResponse(res, 200, 'Chat history retrieved successfully', {
      channelId: channel._id,
      client: {
        id: channel.client._id,
        handle: channel.client.handle
      },
      astrologer: {
        id: channel.astrologer._id,
        handle: channel.astrologer.handle
      },
      isActive: channel.isActive,
      expiresAt: channel.expiresAt,
      messages: decryptedMessages
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// Upload file
exports.uploadFile = async (req, res) => {
  const uploadMiddleware = upload.single('file');

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return errorResponse(res, 400, err.message);
    }

    try {
      if (!req.file) {
        return errorResponse(res, 400, 'No file uploaded');
      }

      const { channelId } = req.params;
      const userId = req.user.userId;
      const role = req.user.role;

      const channel = await ChatChannel.findById(channelId);

      if (!channel || !channel.isActive) {
        // Remove uploaded file if channel is invalid
        fs.unlinkSync(req.file.path);
        return errorResponse(res, 404, 'Chat channel not found or inactive');
      }

      // Check if user has access to this channel
      const isClient = channel.client.toString() === req.user.profileId;
      const isAstrologer = channel.astrologer.toString() === req.user.profileId;

      if (!isClient && !isAstrologer) {
        // Remove uploaded file if user doesn't have access
        fs.unlinkSync(req.file.path);
        return errorResponse(res, 403, 'Access denied to this channel');
      }

      // Generate file URL
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      // Determine content type based on file mimetype
      const contentType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';

      // Add file message to chat
      const encryptedFileUrl = encryptionService.encrypt(fileUrl);

      channel.messages.push({
        sender: role,
        content: encryptedFileUrl,
        contentType,
        fileUrl,
        timestamp: new Date()
      });

      await channel.save();

      return successResponse(res, 200, 'File uploaded successfully', {
        fileUrl,
        contentType,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Upload file error:', error);

      // Remove uploaded file if there's an error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return errorResponse(res, 500, 'Server error during file upload');
    }
  });
};

// Rate an astrologer
exports.rateAstrologer = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { rating } = req.body; // 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(rating)) {
      return errorResponse(res, 400, 'Invalid rating value');
    }

    const channel = await ChatChannel.findById(channelId);

    if (!channel) {
      return errorResponse(res, 404, 'Chat channel not found');
    }

    // Only clients can rate astrologers
    if (req.user.role !== 'client') {
      return errorResponse(res, 403, 'Only clients can rate astrologers');
    }

    // Check if user is the client of this channel
    if (channel.client.toString() !== req.user.profileId) {
      return errorResponse(res, 403, 'Access denied');
    }

    // Check if already rated
    if (channel.hasRated) {
      return errorResponse(res, 400, 'You have already rated this consultation');
    }

    // Update astrologer reputation
    const Astrologer = mongoose.model('Astrologer');
    const astrologer = await Astrologer.findById(channel.astrologer);

    if (!astrologer) {
      return errorResponse(res, 404, 'Astrologer not found');
    }

    // Update reputation
    if (rating === 'upvote') {
      astrologer.reputation += 1;
    } else {
      astrologer.reputation = Math.max(0, astrologer.reputation - 1);
    }

    await astrologer.save();

    // Mark channel as rated
    channel.hasRated = true;
    channel.rating = rating;
    await channel.save();

    return successResponse(res, 200, 'Astrologer rated successfully');
  } catch (error) {
    console.error('Rate astrologer error:', error);
    return errorResponse(res, 500, 'Server error during rating');
  }
};

// Get active users in a channel
exports.getActiveUsers = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await ChatChannel.findById(channelId);

    if (!channel) {
      return errorResponse(res, 404, 'Chat channel not found');
    }

    const isClient = channel.client.toString() === req.user.profileId;
    const isAstrologer = channel.astrologer.toString() === req.user.profileId;

    if (!isClient && !isAstrologer) {
      return errorResponse(res, 403, 'Access denied to this channel');
    }

    return successResponse(res, 200, 'Active users retrieved', {
      activeUsers: [] // Placeholder for active users from socket.io
    });
  } catch (error) {
    console.error('Error getting active users:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return errorResponse(res, 400, 'Message IDs array is required');
    }

    const channel = await ChatChannel.findById(channelId);

    if (!channel) {
      return errorResponse(res, 404, 'Chat channel not found');
    }

    const isClient = channel.client.toString() === req.user.profileId;
    const isAstrologer = channel.astrologer.toString() === req.user.profileId;

    if (!isClient && !isAstrologer) {
      return errorResponse(res, 403, 'Access denied to this channel');
    }

    const userRole = req.user.role;

    for (const messageId of messageIds) {
      const messageIndex = channel.messages.findIndex(
        msg => msg._id.toString() === messageId
      );

      if (messageIndex !== -1) {
        if (!channel.messages[messageIndex].readBy) {
          channel.messages[messageIndex].readBy = [];
        }

        if (!channel.messages[messageIndex].readBy.includes(userRole)) {
          channel.messages[messageIndex].readBy.push(userRole);
        }
      }
    }

    await channel.save();

    return successResponse(res, 200, 'Messages marked as read');
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// Get unread message count
exports.getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const profileId = req.user.profileId;

    const query = userRole === 'client'
      ? { client: profileId }
      : { astrologer: profileId };

    const channels = await ChatChannel.find(query);

    let totalUnread = 0;
    const channelUnread = {};

    for (const channel of channels) {
      let channelUnreadCount = 0;

      for (const message of channel.messages) {
        if (message.sender === userRole) continue;

        const readBy = message.readBy || [];
        if (!readBy.includes(userRole)) {
          channelUnreadCount++;
        }
      }

      totalUnread += channelUnreadCount;
      channelUnread[channel._id] = channelUnreadCount;
    }

    return successResponse(res, 200, 'Unread message count retrieved', {
      totalUnread,
      channelUnread
    });
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return errorResponse(res, 500, 'Server error');
  }
};