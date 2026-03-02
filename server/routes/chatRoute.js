const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/hotel', authMiddleware, chatController.chatWithHotel);

module.exports = router;
