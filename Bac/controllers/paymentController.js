const Payment = require('../models/paymentModel');

// Create a payment
const createPayment = async (req, res) => {
  const { auctionId, amount, paymentMethod } = req.body;

  try {
    const payment = new Payment({
      auctionId,
      buyerId: req.user._id, // Assuming the buyer is logged in
      sellerId: req.body.sellerId,
      amount,
      paymentMethod
    });
    await payment.save();
    res.status(201).json({ message: 'Payment created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error });
  }
};

// Handle payment disputes
const handleDispute = async (req, res) => {
  const { paymentId, reason } = req.body;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    payment.dispute = { isDisputed: true, reason };
    await payment.save();
    res.status(200).json({ message: 'Dispute filed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error handling dispute', error });
  }
};

module.exports = {
  createPayment,
  handleDispute
};
