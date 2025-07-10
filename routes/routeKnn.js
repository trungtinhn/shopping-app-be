const knnRecommend = require('../controllers/knnController')

const router = require('express').Router()

router.get('/knnRecommendLike/:userId', knnRecommend.knnRecommendLike)
router.get('/knnRecommendSell/:userId', knnRecommend.knnRecommendSell)
router.get('/knnRecommendSearch/:userId', knnRecommend.knnRecommendSearch)
router.get('/knnRecommendSimilar/:productId', knnRecommend.knnRecommendSimilar)

module.exports = router