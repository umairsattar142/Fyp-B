const express = require('express');
const router = express.Router();
const Chat = require('../models/chatModel'); // Adjust path as needed
const ChatNote = require('../models/chatsNote'); // Adjust path as needed



router.post('/messages', async (req, res) => {
  try {
    const { 
      roomId, 
      senderId, 
      recipientId, 
      content, 
      timestamp, 
      productName,
      productId 
    } = req.body;

    // Validate required fields
    if (!roomId || !senderId || !recipientId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Find or create a chat room specifically for this product and users
    let chat = await Chat.findOne({ 
      roomId,
      productName 
    });

    if (!chat) {
      // Create new chat if room doesn't exist
      chat = new Chat({
        roomId,
        productId,
        productName,
        participants: [senderId, recipientId],
        messages: []
      });
    }

    // Add new message
    chat.messages.push({
      senderId,
      recipientId,
      content,
      timestamp: timestamp || new Date()
    });

    chat.lastMessage = new Date();

    // Save the chat
    await chat.save();

    res.status(201).json({ 
      success: true, 
      message: 'Message saved successfully',
      savedMessage: chat.messages[chat.messages.length - 1]
    });

  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save message', 
      error: error.message 
    });
  }
});

// Fetching messages
router.get('/messages', async (req, res) => {
  try {
    const { productName, roomId } = req.query;

    if (!productName && !roomId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product name or room ID is required' 
      });
    }

    // Find chat by both roomId and productName
    const chat = await Chat.findOne({ 
      roomId, 
      productName 
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: 'No messages found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      messages: chat.messages 
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages', 
      error: error.message 
    });
  }
});


router.get('/notifications/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log("User ID for notifications:", userId);
  
  try {
    const unreadNotifications = await ChatNote.find({
      recipientId: userId, 
      read: false  
    }).sort({ timestamp: -1 }); 
    
    return res.status(200).json({
      data: unreadNotifications,
      message: "Notifications received successfully.",
      count: unreadNotifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch notifications',
      message: 'An error occurred while fetching notifications'
    });
  }
});



router.post('/notifications/mark-read', async (req, res) => {
  const { userId } = req.body; // Correctly retrieve userId from the request body
  console.log("User ID for notifications:", userId);

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await ChatNote.updateMany(
      { 
        recipientId: userId, 
        read: false 
      },
      { $set: { read: true } } // Use $set for clarity
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});



module.exports = router;