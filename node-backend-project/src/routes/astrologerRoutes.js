const express = require('express');
const astrologerController = require('../controllers/astrologerController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

const router = express.Router();

// Apply authentication middleware to all astrologer routes
router.use(authMiddleware);
// Ensure user has astrologer role
router.use(roleMiddleware('astrologer'));

// Get available requests
router.get('/requests', astrologerController.getAvailableRequests);

// Accept a request
router.post('/accept/:requestId', astrologerController.acceptRequest);

// Get astrologer dashboard data
router.get('/dashboard', astrologerController.getDashboard);

// Make payment to unlock more requests
router.post('/payment', astrologerController.makePayment);

module.exports = router;