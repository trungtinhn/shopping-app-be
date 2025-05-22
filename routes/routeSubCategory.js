const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');
const verifyToken = require('../middleware/verifyToken');

// Tạo mới
router.post('/', verifyToken, subCategoryController.create);

// Lấy tất cả
router.get('/', verifyToken ,subCategoryController.getAll);

// Lấy theo ID
router.get('/:id', verifyToken , subCategoryController.getById);

// Lấy tất cả sub theo globalCategoryId
router.get('/global/:globalCategoryId', verifyToken, subCategoryController.getByGlobalCategoryId);

// Cập nhật
router.put('/:id', verifyToken, subCategoryController.update);

// Xoá
router.delete('/:id', verifyToken, subCategoryController.delete);

module.exports = router;
