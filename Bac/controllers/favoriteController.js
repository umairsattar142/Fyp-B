const Favorite = require('../models/favoriteModel');
const Item = require('../models/itemModel');
const Auction = require("../models/auctionModel")
// Get all favorites for a user
exports.getFavId = async (req,res)=>{
    try {
        const userId = req.user.id
        const favorites = await Favorite.findOne({ userId });
        console.log(favorites)
        res.status(200).json({favorites})
    } catch (error) {
        res.status(500).json({ message: 'Error fetching favorites', error: error.message });
    }
}
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const favorites = await Favorite.findOne({ userId });
        const auctions = await Auction.find({itemId:{$in:favorites.itemIds}}).populate("itemId")
        if (!favorites) {
            return res.status(200).json({ message: 'No favorites found', items: [] });
        }

        res.status(200).json({ items: auctions });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching favorites', error: error.message });
    }
};

// Add an item to favorites
exports.addFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.id;

        // Check if the item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        let favorite = await Favorite.findOne({ userId });

        if (!favorite) {
            // If no favorite document exists for the user, create a new one
            favorite = new Favorite({ userId, itemIds: [itemId] });
        } else {
            // If the item is not already in favorites, add it
            if (!favorite.itemIds.includes(itemId)) {
                favorite.itemIds.push(itemId);
            } else {
                return res.status(400).json({ message: 'Item already in favorites' });
            }
        }

        await favorite.save();
        res.status(200).json({ message: 'Item added to favorites successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding item to favorites', error: error.message });
    }
};

// Remove an item from favorites
exports.removeFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.id;

        const favorite = await Favorite.findOne({ userId });

        if (!favorite) {
            return res.status(404).json({ message: 'Favorites not found for this user' });
        }

        const itemIndex = favorite.itemIds.indexOf(itemId);
        if (itemIndex > -1) {
            favorite.itemIds.splice(itemIndex, 1);
            await favorite.save();
            res.status(200).json({ message: 'Item removed from favorites successfully' });
        } else {
            res.status(400).json({ message: 'Item not found in favorites' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error removing item from favorites', error: error.message });
    }
};
