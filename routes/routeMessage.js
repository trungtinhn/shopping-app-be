const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const verifyToken = require('../middleware/verifyToken');


router.post('/chat/summary', verifyToken, messageController.getChatSummary);

module.exports = router;
