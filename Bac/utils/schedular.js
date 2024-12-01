// utils/scheduler.js
const cron = require('node-cron');
const Auction = require('../models/auctionModel');
const auctionController = require('../controllers/auctionController');
const Item = require("../models/itemModel")
// Schedule auction closure every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    // Find auctions that have reached their end time and are still active
    const itemsToClose = await Item.find({auctionEndDate:{$lte:now},isApproved:true}).select("_id");
    console.log(itemsToClose)
    const itemIDs =itemsToClose.map(item=> item._id)
    const auctionsToClose = await Auction.find({itemId:{$in:itemIDs}})
    for (const auction of auctionsToClose) {
      await auctionController.closeAuction(auction._id);
    }

    console.log('Auction closure job ran successfully');
  } catch (error) {
    console.error('Error running auction closure job:', error);
  }
});
