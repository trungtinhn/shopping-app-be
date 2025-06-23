const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/conversationController');
const verifyToken = require('../middleware/verifyToken');

router.get('/', verifyToken, ConversationController.getConversations);

// GET /api/conversations/:id - Lấy thông tin conversation theo ID
router.get('/:id',verifyToken, ConversationController.getConversationById);

// GET /api/conversations/:id/messages - Lấy messages của conversation
router.get('/:id/messages',verifyToken, ConversationController.getMessageConversation);

// POST /api/conversations - Tạo conversation mới
router.post('/',verifyToken, ConversationController.createConversation);

// POST /api/conversations/:id/messages - Gửi message
router.post('/:id/messages',verifyToken, ConversationController.sendMessage);

// PUT /api/conversations/:id/read - Đánh dấu đã đọc
router.put('/:id/read',verifyToken, ConversationController.markasRead);

router.get('/getConversationsByStoreId/:storeId', verifyToken, ConversationController.getConversationsByStoreId);

module.exports = router;
