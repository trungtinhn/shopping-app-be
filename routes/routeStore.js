const express = require('express');
const router = express.Router();

const routerController = require('../controllers/storeController');
const verifyToken = require('../middleware/verifyToken');

router.post('/addStore', routerController.addStore);
router.get('/getStores', verifyToken ,routerController.getAllStores);
router.get('/getStoreById/:id', verifyToken ,routerController.getStoreById);
router.put('/updateStore/:id', verifyToken ,routerController.updateStore);
router.delete('/deleteStore/:id', verifyToken ,routerController.deleteStore);
router.patch('/approveStore/:id', routerController.approveStore);
router.get("/overview/:storeId", verifyToken, routerController.getStoreOverview);
router.get('/monthly-stats/:storeId', verifyToken, routerController.getStoreMonthlyStats);
module.exports = router;


