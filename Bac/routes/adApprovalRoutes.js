const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const AdApprovalController = require('../controllers/adApprovalController');

// Admin routes
router.use(authMiddleware);
router.use(roleMiddleware(true));

router.post('/approve/:adId', AdApprovalController.approveAd);

module.exports = router;
