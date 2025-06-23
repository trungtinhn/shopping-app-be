const categoryController = require('../controllers/categoryController')

const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')

router.post('/addCategory', verifyToken , categoryController.addCategory)
router.put('/:id', verifyToken ,categoryController.updateCategory),
router.delete('/:id', verifyToken , categoryController.deleteCategory),
router.get('/getCategory', verifyToken ,categoryController.getCategory),
router.put('/updateProductAmount/:id', verifyToken ,categoryController.updateProductAmountInCategory),
router.get('/getCategoriesByStoreId/:storeId', verifyToken ,categoryController.getCategoriesByStore),
router.get('/:id', verifyToken ,categoryController.getCategoryById),
module.exports = router