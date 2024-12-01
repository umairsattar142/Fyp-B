const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  currentHighestBid: { type: Number, default: 0 },
  currentHighestBidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bids: [{
    bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bidAmount: { type: Number },
    bidTime: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['active', 'completed', 'cancelled','failed'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Auction', AuctionSchema);
