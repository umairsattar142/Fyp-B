const mongoose = require('mongoose');

const chatNoteSchema = new mongoose.Schema({
  recipientId: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatNote = mongoose.model('chatNote', chatNoteSchema);
module.exports = ChatNote;
