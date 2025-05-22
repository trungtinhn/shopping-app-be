const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const verifyToken = require('../middleware/verifyToken');

router.post('/addPromotion', verifyToken ,promotionController.addPromotion);
router.get('/getAllPromotions', verifyToken ,promotionController.getAllPromotions);
router.get('/getPromotionById/:id', verifyToken, promotionController.getPromotionById);
router.put('/updatePromotion/:id', verifyToken ,promotionController.updatePromotion);
router.delete('/deletePromotion/:id', verifyToken ,promotionController.deletePromotion);
router.get('/getAvailablePromotionsForUser/:userId', verifyToken ,promotionController.getAvailablePromotionsForUser);
router.get('/checkPromotion/:id', verifyToken ,promotionController.checkPromotion);

module.exports = router;
