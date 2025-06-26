const express = require('express');
const VNPayController = require('../controllers/vnpayController');

const router = express.Router();
const vnpayController = new VNPayController();

// Tạo URL thanh toán
router.post('/create-payment', vnpayController.createPaymentUrl);

// Xử lý kết quả thanh toán (Return URL)
router.get('/return', vnpayController.handleReturn);

// Xử lý IPN (Instant Payment Notification)
router.post('/ipn', vnpayController.handleIPN);

// Lấy trạng thái thanh toán
router.get('/payment-status/:orderId', vnpayController.getPaymentStatus);

module.exports = router;
