const express = require('express');
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all request routes
router.use(authMiddleware);

// Get request details
router.get('/:requestId', requestController.getRequestDetails);

// Close a request (client only)
router.put('/:requestId/close', requestController.closeRequest);

module.exports = router;