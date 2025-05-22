const express = require('express');
const router = express.Router();
const parameterController = require('../controllers/parameterController');

router.get('/get', verifyToken , parameterController.getParameter);

router.put('/update', verifyToken , parameterController.updateParameter);

module.exports = router;
