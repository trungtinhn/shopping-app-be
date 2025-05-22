const express = require('express');
const rankController = require('../controllers/rankController');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

// Route: Tạo hoặc cập nhật thông tin xếp hạng của khách hàng
router.post('/upsert', verifyToken, rankController.upsertRank);

// Route: Lấy thông tin xếp hạng của một khách hàng theo userId
router.get('/:userId', verifyToken, rankController.getRankByUserId);

// Route: Lấy danh sách tất cả xếp hạng
router.get('/all', verifyToken, rankController.getAllRanks);

module.exports = router;
