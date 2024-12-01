const Auction = require("../models/auctionModel");
const Item = require("../models/itemModel");
const { notifyHighestBidder, notifySellerForAuctionClose } = require("../utils/email-service");

// Start an auction for an item
const startAuction = async (req, res) => {
  const { itemId } = req.body;

  try {
  
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    item.isAuctionStarted=true
    await item.save()
    const auction = new Auction({
      itemId,
      currentHighestBid: item.startingBid,
    });
    await auction.save();
    res.status(201).json({ message: "Auction started successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error starting auction", error });
  }
};

// Place a bid
const placeBid = async (req, res) => {
  const { auctionId, bidAmount } = req.body;

  try {
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    if (bidAmount <= auction.currentHighestBid) {
      return res
        .status(400)
        .json({
          message: "Bid amount must be higher than the current highest bid",
        });
    }
    auction.bids.push({ bidderId: req.user._id, bidAmount });
    auction.currentHighestBid = bidAmount;
    auction.currentHighestBidderId = req.user._id;
    await auction.save();
    res.status(200).json({ message: "Bid placed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error placing bid", error });
  }
};

// End an auction
const endAuction = async (req, res) => {
  const { auctionId } = req.params;

  try {
    const auction = await Auction.findByIdAndUpdate(
      auctionId,
      { status: "completed" },
      { new: true }
    );
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    res.status(200).json(auction);
  } catch (error) {
    res.status(500).json({ message: "Error ending auction", error });
  }
};

// Close an auction
const closeAuction = async (auctionId) => {
  try {
    const auction = await Auction.findById(auctionId)
      .populate('itemId')
      .populate('currentHighestBidderId')
      .populate("itemId.sellerId")
      ;
      
    if (!auction) {
      throw new Error(ERROR_MESSAGES.AUCTION_NOT_FOUND);
    }

    // Check if the auction is already closed
    if (auction.status === 'completed' || auction.status === 'failed') {
      return { message: 'Auction already closed' };
    }

    const now = new Date();
    console.log(auction)
    if (now >= auction.itemId.auctionEndDate) {
      if (auction.currentHighestBid > auction.itemId.startingBid && auction.currentHighestBidderId) {
        // Mark as completed and notify seller and highest bidder
        auction.status = 'completed';
        // Transfer ownership or trigger further actions (payment, etc.)
        // Notify the seller and the highest bidder (via email, notification, etc.)
        const message="Congratulations! You are the highest bidder of the item and You Won an Auction.Kindly processed to the payment."
        await notifyHighestBidder(auction.currentHighestBidderId.email,message)
        await notifySellerForAuctionClose(auction.itemId.sellerId.email,message)
      } else {
        // No bids, mark as failed
        auction.status = 'failed';
      } 
      
      await auction.save();

      return { message: 'Auction closed successfully', auction };
    } else {
      return { message: 'Auction is still active' };
    }
  } catch (error) {
    throw new Error(`Error closing auction: ${error.message}`);
  }
};

module.exports = {
  startAuction,
  placeBid,
  endAuction,
  closeAuction
};
