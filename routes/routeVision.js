const express = require('express');
const router = express.Router();
const multer = require('multer');
const visionController = require('../controllers/visionController');
const verifyToken = require('../middleware/verifyToken');

const upload = multer(); // Xử lý file ảnh

router.post('/analyze', verifyToken, upload.single('image'), visionController.analyzeImage);

module.exports = router;