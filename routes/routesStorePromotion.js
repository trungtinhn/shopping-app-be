const express = require('express');
const router = express.Router();
const storePromotionController = require('../controllers/storePromotionController');
const verifyToken = require('../middleware/verifyToken');

// Tạo mới một khuyến mãi
router.post('/', verifyToken, storePromotionController.createstorePromotion);

// Xóa khuyến mãi theo ID
router.delete('/:id', verifyToken, storePromotionController.deletePromotion);

// Cập nhật khuyến mãi theo ID
router.put('/:id', verifyToken, storePromotionController.updatePromotion);

//Cập nhật trạng thái khuyến mãi theo ID
router.put('/status/:id', verifyToken, storePromotionController.updatePromotionStatus);

// Lấy danh sách khuyến mãi theo storeId
router.get('/store/:storeId', verifyToken, storePromotionController.getBystoreId);

// Lấy tất cả khuyến mãi
router.get('/all', verifyToken, storePromotionController.getAllPromotions);

// Lấy danh sách khuyến mãi hiện tại
router.get('/current', verifyToken, storePromotionController.getPromotionCurrent);

// Kiểm tra khuyến mãi theo ID
router.get('/check/:id', verifyToken, storePromotionController.checkPromotion);

module.exports = router;
