const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/index').authController;
const clientController = require('../controllers/index').clientController;
const astrologerController = require('../controllers/index').astrologerController;
const requestController = require('../controllers/index').requestController;
const chatController = require('../controllers/index').chatController;

// Define routes
router.post('/auth', authController.login);
router.post('/clients', clientController.create);
router.get('/clients/:id', clientController.getById);
router.post('/astrologers', astrologerController.create);
router.get('/astrologers/:id', astrologerController.getById);
router.post('/requests', requestController.create);
router.get('/requests/:id', requestController.getById);
router.post('/chats', chatController.create);
router.get('/chats/:id', chatController.getById);

// Export the router
module.exports = router;