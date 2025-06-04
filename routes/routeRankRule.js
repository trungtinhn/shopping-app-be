const express = require('express');
const rankRuleController = require('../controllers/rankRuleController');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

// Lấy tất cả hang thanh vien
router.get('/', verifyToken , rankRuleController.getAllRankRules);

// // Lấy một hang thanh vien theo ID
// router.get('/:id', verifyToken , rankRuleController.getRankRuleByRank);

// Tạo một hang thanh vien mới
router.post('/', verifyToken , rankRuleController.createRankRule);

// Cập nhật hang thanh vien theo ID
router.put('/:id', verifyToken , rankRuleController.updateRankRule);

// Xóa hang thanh vien theo ID
router.delete('/:id', verifyToken , rankRuleController.deleteRankRule);


module.exports = router;
