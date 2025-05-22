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

module.exports = router;
