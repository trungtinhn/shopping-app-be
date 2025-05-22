const express = require('express');
const router = express.Router();
const reviewController = require("../controllers/reviewCotroller");

router.post('/addReview', verifyToken , reviewController.addReview);
router.get('/getReviews', verifyToken , reviewController.getAllReviews);
router.get('/getReviewById/:id', verifyToken , reviewController.getReviewById);
router.put('/updateReview/:id', verifyToken ,reviewController.updateReview);
router.delete('/deleteReview/:id', verifyToken , reviewController.deleteReview);

module.exports = router;
