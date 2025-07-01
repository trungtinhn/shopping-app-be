const express = require('express');
const router = express.Router();

const geminiController = require('../controllers/geminiController');
const { upload } = require('../middleware/upload');

// POST /api/keywords - Tạo keywords từ upload file
router.post('/analyze', upload.single('image'), geminiController.generateFromImage);

// POST /api/keywords/from-url - Tạo keywords từ URL ảnh
router.post('/from-url', geminiController.generateFromUrl);

module.exports = router;