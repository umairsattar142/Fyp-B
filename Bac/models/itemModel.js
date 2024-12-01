const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  startingBid: { type: Number, required: true },
  catagory:[{type:String}],
  images: [{ type: String }], // Array of URLs or paths to images of the item
  statusText:{type:String,default:"Review"},
  auctionStartDate: { type: Date, required: true },
  isAuctionStarted:{type:Boolean,required:false,default:false},
  auctionEndDate: { type: Date, required: true },
  isApproved: { type: Boolean, default: false }, // Admin approval flag
  isRequested: { type: Boolean, default: false }, // Admin approval flag
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);
