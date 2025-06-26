const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken')

router.post('/register', userController.registerEmailPassword);
router.get('/:userId', verifyToken, userController.getUserTypeByUserId);
router.put('/:userId', verifyToken, userController.updateUser);
router.delete('/:userId', verifyToken, userController.deleteUser);
router.get('/getUser/:userId', verifyToken, userController.getCurrentUserData);
router.get('/users', verifyToken, userController.getAllUsers);
router.post('/registerSocial', verifyToken, userController.registerSocial);
router.post('/updateFCMToken', verifyToken, userController.updateFCMToken);
module.exports = router;