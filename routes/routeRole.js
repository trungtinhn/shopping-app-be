const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const verifyToken = require('../middleware/verifyToken');

// Tạo role
router.post('/create', verifyToken, roleController.create);

// Lấy tất cả roles
router.get('/getAll', verifyToken, roleController.getAll);

// Lấy role theo ID
router.get('/:id', verifyToken, roleController.getById);

// Cập nhật role
router.put('/:id', verifyToken, roleController.update);

// Xoá role
router.delete('/:id', verifyToken, roleController.delete);

//Lấy role staff của cửa hàng
router.get('/staff-role/:storeId', verifyToken, roleController.getStaffRole);

//Kiểm tra cửa hàng có bảng role chưa
router.get('/check-staff-role/:storeId', verifyToken, roleController.checkStaffRole);

module.exports = router;
