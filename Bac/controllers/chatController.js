const Chat = require("../models/chatModel");

// Get all chats for a user
const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name email")
      .populate("productId", "title images")
      .sort({ lastMessage: -1 });
    
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get specific chat between users for a product
const getChat = async (req, res) => {
  try {
    const { userId, otherUserId, productId } = req.params;
    
    const chat = await Chat.findOne({
      participants: { $all: [userId, otherUserId] },
      productId: productId
    })
      .populate("participants", "name email")
      .populate("productId", "title images")
      .populate("messages.senderId", "name email");
    
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserChats, getChat };