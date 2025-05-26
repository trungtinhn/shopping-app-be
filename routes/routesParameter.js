const express = require('express');
const router = express.Router();
const parameterController = require('../controllers/parameterController');
const verifyToken = require('../middleware/verifyToken');

router.get('/get', verifyToken , parameterController.getParameter);

router.put('/update', verifyToken , parameterController.updateParameter);

module.exports = router;
