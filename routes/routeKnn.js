const knnRecommend = require('../controllers/knnController')

const router = require('express').Router()

router.get('/knnRecommendLike/userId=:userId', knnRecommend.knnRecommendLike)
router.get('/knnRecommendSell/userId=:userId', knnRecommend.knnRecommendSell)
router.get('/knnRecommendSearch/userId=:userId', knnRecommend.knnRecommendSearch)

module.exports = router