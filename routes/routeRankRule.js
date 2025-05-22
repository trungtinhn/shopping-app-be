const express = require('express');
const rankController = require('../controllers/rankController');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
/**
 * @route   POST /api/ranks/upsert
 * @desc    Tạo hoặc cập nhật thông tin xếp hạng của khách hàng
 * @access  Private
 */
router.post('/upsert', verifyToken, rankController.upsertRank);

/**
 * @route   GET /api/ranks/:userId
 * @desc    Lấy thông tin xếp hạng của một khách hàng
 * @access  Private
 */
router.get('/:userId', verifyToken, rankController.getRankByUserId);

/**
 * @route   GET /api/ranks/all
 * @desc    Lấy danh sách tất cả xếp hạng
 * @access  Private
 */
router.get('/all', verifyToken, rankController.getAllRanks);

module.exports = router;
