const express = require('express');
const router = express.Router();
const adminAppController = require('../controllers/adminAppController');
const verifyToken = require('../middleware/verifyToken');

router.get('/getOverview', adminAppController.getSystemOverview);
router.get('/monthly-stats', adminAppController.getMonthlyStats);

module.exports = router;