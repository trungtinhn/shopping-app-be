// routes/userActivityRoutes.js
const express = require('express');
const router = express.Router();
const userActivityController = require('../controllers/userActivityController');
const verifyToken = require('../middleware/verifyToken')

router.post('/', verifyToken ,userActivityController.create);
router.get('/', verifyToken , userActivityController.getAll);
router.get('/:id', verifyToken , userActivityController.getById);
router.delete('/:id', verifyToken , userActivityController.delete);

module.exports = router;
