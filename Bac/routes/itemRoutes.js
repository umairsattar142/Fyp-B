const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const ItemController = require('../controllers/itemController');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protected routes
router.use(authMiddleware);

router.get('/', ItemController.listItems);
router.get('/admin', ItemController.listallItems);
router.get('/wonItems', ItemController.getWonItems);
router.get('/soldItems', ItemController.getSoldItems);
router.get('/demanded', ItemController.getItemsWithMostBids);
router.get('/seller', ItemController.getSellerItems);
router.get('/:id', ItemController.getItemById);
router.get('/admin/:id', ItemController.getItemByIdAdmin);
router.get('/search/:search', ItemController.searhcItems);
router.post('/', ItemController.createItem);
router.post('/recent', ItemController.getAuctionItemsByIds);
router.put('/:id', ItemController.updateItem);
router.delete('/:id', ItemController.deleteItem);



module.exports = router;
