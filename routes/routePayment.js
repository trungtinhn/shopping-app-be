const paymentController = require('../controllers/paymentController')

const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')

router.post('/paymentSheet', verifyToken , paymentController.paymentSheet)

module.exports = router