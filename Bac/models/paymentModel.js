const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'disputed'], default: 'pending' },
  dispute: {
    isDisputed: { type: Boolean, default: false },
    reason: { type: String },
    resolution: { type: String },
    resolvedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
