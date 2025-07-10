const deliveryController = require('../controllers/deliveryController');
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

router.post('/calculateDelivery', deliveryController.calculateShippingFee);
router.get('/getAvailableServices', verifyToken , deliveryController.getAvailableServices);
router.post('/estimateDeliveryTime' , deliveryController.estimateDeliveryTime);
router.get('/getProvinces' , deliveryController.getProvinces);
router.get('/getDistricts', deliveryController.getDistricts);
router.get('/getWards', deliveryController.getWards);
router.patch('/confirmDelivery/:id', deliveryController.createGHNOrder);
router.get('/getGHNOrder/:id', deliveryController.getGHNOrderStatus);
router.get('/search-address', deliveryController.searchAddress);
module.exports = router;