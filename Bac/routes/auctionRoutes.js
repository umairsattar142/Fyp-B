const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const AuctionController = require('../controllers/auctionController');

// Protected routes
router.use(authMiddleware);

router.post('/start', AuctionController.startAuction);
router.post('/bid', AuctionController.placeBid);
router.post('/end/:auctionId', AuctionController.endAuction);

module.exports = router;
