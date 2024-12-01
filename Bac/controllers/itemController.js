const Item = require("../models/itemModel");
const Auction = require("../models/auctionModel");
const { notifySellerForAdApproval } = require("../utils/email-service");

// List all items
const listItems = async (req, res) => {
  try {
    const items = await Auction.find().populate("itemId");
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
};
const listallItems=async (req,res)=>{
  try {
    const items= await Item.find().sort({"isApproved":"descending"})
    res.status(200).json(items);
  } catch (error) {
    console.log(error)
    res.status(500).json({error})
  }
}
// Get item by ID
const getItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Auction.findOne({ itemId: id })
      .populate("itemId")
      .populate("bids.bidderId")
      .populate("currentHighestBidderId");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Error fetching item", error });
  }
};

// Create a new item
const createItem = async (req, res) => {
  const {
    title,
    description,
    startingBid,
    images,
    auctionStartDate,
    auctionEndDate,
    isRequested,
    catagory
  } = req.body;

  try {
    const newItem = new Item({
      sellerId: req.user._id, // Assume the seller is logged in
      title,
      description,
      startingBid,
      images,
      auctionStartDate,
      auctionEndDate,
      isRequested,
      catagory
    });
    await newItem.save();
    res.status(201).json({ message: "Item created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating item", error });
  }
};

// Update item
const updateItem = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const item = await Item.findByIdAndUpdate(id, updates, { new: true }).populate("sellerId");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    await notifySellerForAdApproval(item.sellerId.email,`This is a notifying message from rarefinds team that your item has been ${item.statusText}`)
    res.status(200).json(item);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating item", error });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    const auction = await Auction.findOne({itemId:id})
    await auction.deleteOne()
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error });
  }
};

// Get items with most bids
const getItemsWithMostBids = async (req, res) => {
  try {
    const items = await Auction.aggregate([
      {
        $lookup: {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item'
        }
      },
      {
        $unwind: '$item'
      },
      {
        $match: {
          'item.isApproved': true,
          'bids.0': { $exists: true }
        }
      },
      {
        $project: {
          _id: '$item._id',
          title: '$item.title',
          image: { $arrayElemAt: ['$item.images', 0] },
          bidCount: { $size: '$bids' },
          itemId: '$itemId',
          currentHighestBid: '$currentHighestBid'
        }
      },
      {
        $sort: { bidCount: -1 }
      },
      {
        $limit: 5 // Adjust this number to get more or fewer items
      }
    ]);
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items with most bids:', error);
    res.status(500).json({ message: 'Error fetching items with most bids', error: error.message });
  }
};

// Get items by IDs that are in auctions
const getAuctionItemsByIds = async (req, res) => {
  try {
    console.log("recent")
    const { ids } = req.body; // Expecting an array of item IDs in the request body
    console.log(ids)
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or empty array of item IDs" });
    }
    const auctionItems = await Auction.find({ 
      itemId: { $in: ids },
    }).populate('itemId');
    console.log(auctionItems)
    if (auctionItems.length === 0) {
      return res.status(404).json({ message: "No auction items found with the provided IDs" });
    }

    // Extract the item details from the auction documents
    const items = auctionItems.map(auction => auction.itemId);

    res.status(200).json(auctionItems);
  } catch (error) {
    console.error('Error fetching auction items by IDs:', error);
    res.status(500).json({ message: 'Error fetching auction items', error: error.message });
  }
};


const searhcItems = async (req, res) => {
  const { search } = req.params;
  try {
    const regex = new RegExp(search, "i"); // 'i' for case-insensitive search
    let items = await Item.find({
      isApproved: true,
      $or: [
        { title: regex }, // Search in title
        { catagory: { $in: [regex] } }, // Search in catagory array
      ],
    }).select("_id");
    const itemIDs = items.map((item) => item._id);
    items = await Auction.find({ itemId: { $in: itemIDs } }).populate("itemId");
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ messge: "Something went wrong", error });
  }
};
// seller items

const getSellerItems = async (req, res) => {
  try {
    // Assuming req.user.id contains the seller's user ID after authentication
    const sellerId = req.user.id;

    // Fetch all items where the seller ID matches the authenticated user's ID
    const items = await Item.find({ sellerId });

    res.status(200).json(items);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR, error });
  }
};

const getItemByIdAdmin=async (req,res)=>{
  const { id } = req.params;
  try {
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching item", error });
  }
}

const getWonItems = async (req, res) => {
  console.log("checking")

  try {
    const items = await Auction.find({
      currentHighestBidderId: req.user.id,
      status: "completed"
    }).populate('itemId');
    console.log(items)
    res.status(200).json({ items });
  } catch (error) {
    console.error("Error in getWonItems:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
const getSoldItems = async(req,res)=>{
  console.log("sell")
  try {
    const items = await Auction.find({status:"completed"})
      .populate({
        path: 'itemId',
        match: { sellerId: req.user.id }
      })
      .exec();
    
    // Filter out auctions where the populated itemId is null (i.e., doesn't match the seller)
    const sellerCompletedAuctions = items.filter(auction => auction.itemId !== null);

    
    res.status(200).json({items:sellerCompletedAuctions})
  } catch (error) {
    console.log(error,"error in sell")
    res.status(500).json({message:"internal server error"})
  }
}
module.exports = {
  listItems,
  listallItems,
  getItemByIdAdmin,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getSellerItems,
  searhcItems,
  getItemsWithMostBids,
  getAuctionItemsByIds,
  getWonItems,
  getSoldItems
};
