const express = require('express');
const router = express.Router();
const {
  getDailyGrowth,
  getWeeklyGrowth,
  getMonthlyGrowth,
  getProductOverview,
  getTopGrowingProducts
} = require('../controllers/analyticsController');

router.get('/products/growth/daily', getDailyGrowth);
router.get('/products/growth/weekly', getWeeklyGrowth);
router.get('/products/growth/monthly', getMonthlyGrowth);
router.get('/products/overview', getProductOverview);
router.get('/products/top-growing', getTopGrowingProducts);

module.exports = router;
