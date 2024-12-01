const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const PaymentController = require('../controllers/paymentController');

// Protected routes
router.use(authMiddleware);

router.post('/create', PaymentController.createPayment);
router.post('/dispute', PaymentController.handleDispute);

module.exports = router;
