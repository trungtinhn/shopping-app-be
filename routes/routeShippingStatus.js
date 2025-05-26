const express = require('express');
const router = express.Router();
const shippingStatusController = require('../controllers/shippingStatusController');

router.post('/', shippingStatusController.createShippingStatus);
router.get('/', shippingStatusController.getAllShippingStatuses);
router.get('/:id', shippingStatusController.getShippingStatusById);
router.put('/:id', shippingStatusController.updateShippingStatus);
router.delete('/:id', shippingStatusController.deleteShippingStatus);

module.exports = router;
