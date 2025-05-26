const deliveryController = require('../controllers/deliveryController');
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

router.get('/calculateDelivery', verifyToken ,deliveryController.calculateShippingFee);
router.get('/getAvailableServices', verifyToken , deliveryController.getAvailableServices);
router.get('/estimateDeliveryTime', verifyToken , deliveryController.estimateDeliveryTime);
router.get('/getProvinces', verifyToken , deliveryController.getProvinces);
router.get('/getDistricts', verifyToken , deliveryController.getDistricts);
router.get('/getWards', verifyToken , deliveryController.getWards);
router.patch('/confirmDelivery/:id', deliveryController.createGHNOrder);
router.get('/getGHNOrder/:id', deliveryController.getGHNOrderStatus);
module.exports = router;