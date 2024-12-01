const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    
  },
  productId: {
    type: String,
    default: null
  },
  productName: {
    type: String,
    default: null
  },
  participants: {
    type: [String],
    required: true,
  },
  messages: [
    {
      senderId: {
        type: String,
        required: true
      },
      recipientId: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  lastMessage: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true  // This adds createdAt and updatedAt fields
});


const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;