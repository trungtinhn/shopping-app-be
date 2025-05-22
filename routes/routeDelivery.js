const deliveryController = require('../controllers/deliveryController');
const express = require('express');
const router = express.Router();

router.get('/calculateDelivery', verifyToken ,deliveryController.calculateShippingFee);
router.get('/getAvailableServices', verifyToken , deliveryController.getAvailableServices);
router.get('/estimateDeliveryTime', verifyToken , deliveryController.estimateDeliveryTime);
router.get('/getProvinces', verifyToken , deliveryController.getProvinces);
router.get('/getDistricts', verifyToken , deliveryController.getDistricts);
router.get('/getWards', verifyToken , deliveryController.getWards);

module.exports = router;