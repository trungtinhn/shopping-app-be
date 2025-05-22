const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/verifyToken')

router.post('/addOrder', verifyToken ,orderController.createOrders);
router.get('/getAllOrder', verifyToken ,orderController.getAllOrders);
router.get('/getOrders/:id',  verifyToken ,orderController.getOrderById);
router.get('/user/:userId', verifyToken ,orderController.getOrdersByUserId);
router.get('/user/:userId/status/:status', verifyToken ,orderController.getOrdersByUserIdAndStatus);
router.put('/updateOrders/:id', verifyToken , orderController.updateOrderById);
router.patch('/:id/status', verifyToken ,orderController.updateOrderStatus);
router.delete('/deleteOrders/:id', verifyToken  , orderController.deleteOrderById);
router.get('/getOrderByStatus/status/:status', verifyToken ,orderController.getOrderByStatus);
router.post('/checkDeliveredProduct', verifyToken ,orderController.checkDeliveredProduct);

module.exports = router;