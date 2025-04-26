// backend/src/routes/chatRoutes.js
const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chatController.js');
const authMiddleware = require('../middleware/auth.js');
const upload = require('../middleware/fileUpload.js');
const { authenticate } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(authMiddleware);

// Get chat history
router.get('/messages/:channelId', chatController.getChatHistory);

// For backward compatibility - redirect old endpoint to new one
router.get('/:channelId', (req, res, next) => {
  req.params.channelId = req.params.channelId;
  chatController.getChatHistory(req, res, next);
});

// Send message (REST API endpoint)
router.post(
  '/:channelId',
  [
    body('content').notEmpty().withMessage('Message content is required'),
    body('contentType').optional().isIn(['text', 'image', 'file'])
  ],
  chatController.sendMessage
);

// Upload file/image
router.post(
  '/upload/:channelId',
  upload.single('file'),
  chatController.uploadFile
);

// For backward compatibility - redirect old endpoint to new one
router.post(
  '/:channelId/file',
  upload.single('file'),
  (req, res, next) => {
    req.params.channelId = req.params.channelId;
    chatController.uploadFile(req, res, next);
  }
);

// Rate astrologer (client only)
router.post(
  '/:channelId/rate',
  [
    body('rating').isIn(['upvote', 'downvote']).withMessage('Rating must be upvote or downvote')
  ],
  chatController.rateAstrologer
);

// Get active users in a channel
router.get('/:channelId/users', chatController.getActiveUsers);

// Mark messages as read
router.post(
  '/:channelId/read',
  chatController.markMessagesAsRead
);

// Get unread message count
router.get('/unread', chatController.getUnreadMessageCount);

module.exports = router;