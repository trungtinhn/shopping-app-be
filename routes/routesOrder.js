const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/verifyToken')

router.post('/addOrderDirect', orderController.createDirectOrders);
router.post('/addOrderFromCart', orderController.createProductFromCart);
router.get('/getAllOrder', verifyToken ,orderController.getAllOrders);
router.get('/getOrders/:id',  verifyToken ,orderController.getOrderById);
router.get('/user/:userId', verifyToken ,orderController.getOrdersByUserId);
router.get('/user/:userId/status/:status', verifyToken ,orderController.getOrdersByUserIdAndStatus);
router.get('/store/:storeId/status/:status', orderController.getOrderByStoreIdAndStatus);
router.put('/updateOrders/:id', verifyToken , orderController.updateOrderById);
router.patch('/:id/status', verifyToken ,orderController.updateOrderStatus);
router.delete('/deleteOrders/:id', verifyToken  , orderController.deleteOrderById);
router.get('/getOrderByStatus/status/:status', verifyToken ,orderController.getOrderByStatus);
router.post('/checkDeliveredProduct', verifyToken ,orderController.checkDeliveredProduct);
router.patch('/:orderId/rating', verifyToken ,orderController.updateOrderRatingStatus);
router.get('/getOrderDetailById/:orderId', verifyToken ,orderController.getOrderDetailById);
router.get('/getOrderDetailByShop/:orderId', orderController.getOrderDetailByShop);
router.get('/getOrderDetailByAdmin/:orderId', orderController.getOrderDetailByAdmin);

module.exports = router;