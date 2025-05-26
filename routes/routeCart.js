const cartController = require('../controllers/cartController');
const verifyToken = require('../middleware/verifyToken');
const router = require('express').Router()

// Cart routes
router.post('/addCart', verifyToken, cartController.addProductToCart);
router.put('/updateCart', verifyToken, cartController.updateProductInCart);
router.delete('/deleteCart', verifyToken, cartController.removeProductFromCart);
router.delete('/clearCart', verifyToken, cartController.clearCart);
router.get('/getCartByUser/:userId', verifyToken, cartController.getCart);

module.exports = router;