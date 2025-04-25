const express = require('express');
const { body } = require('express-validator');
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

const router = express.Router();

// Apply authentication middleware to all client routes
router.use(authMiddleware);
// Ensure user has client role
router.use(roleMiddleware('client'));

// Submit consultation request
router.post(
  '/request',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('birthDate').notEmpty().withMessage('Birth date is required'),
    body('birthTime').notEmpty().withMessage('Birth time is required'),
    body('birthLocation').notEmpty().withMessage('Birth location is required')
  ],
  clientController.submitRequest
);

// Get client's requests
router.get('/requests', clientController.getRequests);

// Block an astrologer
router.post('/block/:astrologerId', clientController.blockAstrologer);

// Expand astrologer pool for a request
router.post('/expand-pool/:requestId', clientController.expandPool);

// Get client dashboard data
router.get('/dashboard', clientController.getDashboard);

module.exports = router;