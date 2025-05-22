const express = require('express');
const router = express.Router();
const globalCategoryController = require('../controllers/globalCategoryController');

// Lấy tất cả danh mục
router.get('/', verifyToken , globalCategoryController.getAllCategories);

// Lấy một danh mục theo ID
router.get('/:id', verifyToken , globalCategoryController.getCategoryById);

// Tạo một danh mục mới
router.post('/', verifyToken , globalCategoryController.createCategory);

// Cập nhật danh mục theo ID
router.put('/:id', verifyToken , globalCategoryController.updateCategory);

// Xóa danh mục theo ID
router.delete('/:id', verifyToken , globalCategoryController.deleteCategory);

module.exports = router;
