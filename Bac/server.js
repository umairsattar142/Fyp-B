const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config.js');
const Chat = require('./models/chatModel');
const Item = require('./models/itemModel');
const User = require('./models/userModel');
const Notification = require('./models/notificationModel');

// Import routes
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adApprovalRoutes = require('./routes/adApprovalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const resetRoutes = require("./routes/passwordResetRoutes");
const feedBackRoutes = require("./routes/feedBackRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const billingRoutes = require("./routes/billingInforoute");
const chatRoutes = require("./routes/chatRoutes");
const ChatNote = require('./models/chatsNote.js');

// Initialize express app and server
const app = express();
const server = http.createServer(app);

// Socket.IO setup with cors
const io = new Server(server, {
  cors: {
    origin: ["exp://192.168.1.17:8081", "http://localhost:8081"],
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  connectTimeout: 60000
});

// Middleware
app.use(cors(config.corsOptions));
app.use(express.json());

// Database connection state
let isConnected = false;

// Socket state management
const connectedUsers = new Map();
const userSockets = new Map();
const messageCache = new Set();

const connectDB = async (retries = 5) => {
  if (isConnected) return;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await mongoose.disconnect();
      await mongoose.connect(config.mongoURI, {
        ...config.dbOptions,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      isConnected = true;
      console.log('MongoDB Connected Successfully');

      mongoose.connection.on('error', handleDBError);
      mongoose.connection.on('disconnected', handleDBDisconnect);
      
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt + 1} failed:`, error);
      if (attempt === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

const handleDBError = (error) => {
  console.error('MongoDB connection error:', error);
  isConnected = false;
  setTimeout(connectDB, 5000);
};

const handleDBDisconnect = () => {
  console.log('MongoDB disconnected');
  isConnected = false;
  setTimeout(connectDB, 5000);
};


const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join room event
    socket.on('join', (data) => {
      const { userId, roomId, productName } = data;
      
      console.log('Join request received:', { userId, roomId, productName });

      if (roomId) {
        // Leave any previous rooms
        socket.leaveAll();
        
        // Join the specific room
        socket.join(roomId);
        
        // Store user socket and room information
        userSockets.set(userId, socket.id);
        connectedUsers.set(userId, roomId);

        // Broadcast to other users in the room that a new user has joined
        socket.to(roomId).emit('userJoined', { 
          userId, 
          productName,
          message: `${userId} has joined the room`
        });

        // Acknowledge successful join to the joining user
        socket.emit('joined', { 
          roomId, 
          message: 'Successfully joined room' 
        });

        console.log(`User ${userId} joined room ${roomId}`);
      }
    });

    // Chat message event with enhanced functionality
    socket.on('chatMessage', async (data) => {
      const { roomId, senderId, recipientId, content, timestamp } = data;
      
      console.log('Chat message received:', data);
      try {
      const newMessage = new ChatNote({
        senderId,
        recipientId,
        message: content,
        roomId,
        read: false, // Mark as unread initially
        timestamp,
      });

      await newMessage.save();

      io.to(roomId).emit('chatMessage', {
        roomId,
        senderId,
        recipientId,
        content,
        timestamp,
        status: 'delivered'
      });

      const recipientSocketId = userSockets.get(recipientId);
      if (recipientSocketId) {
        // Send notification to recipient
        socket.to(roomId).emit('newUnreadNotification', {
          senderId,
          message: content,
          timestamp
        });
      }
    }
     catch (error) {
      console.error('Error saving chat notification:', error);
    }
          });

    // Read receipt event
    socket.on('messageRead', (data) => {
      const { roomId, messageId, readerId } = data;
      
      // Broadcast read receipt to the room
      socket.to(roomId).emit('messageReadConfirmation', {
        messageId,
        readerId,
        readAt: new Date()
      });
    });

    // Typing indicator event
    socket.on('typing', (data) => {
      const { roomId, userId } = data;
      
      // Broadcast typing status to other users in the room
      socket.to(roomId).emit('userTyping', {
        userId,
        isTyping: true
      });
    });

    // Stop typing event
    socket.on('stopTyping', (data) => {
      const { roomId, userId } = data;
      
      // Broadcast stop typing status to other users in the room
      socket.to(roomId).emit('userTyping', {
        userId,
        isTyping: false
      });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      handleDisconnect(socket);
      console.log('Client disconnected:', socket.id);
    });
  });
};



const handleDisconnect = (socket) => {
  for (const [userId, socketId] of userSockets.entries()) {
    if (socketId === socket.id) {
      const roomId = connectedUsers.get(userId);
      if (roomId) {
        // Notify other users in the room about user disconnection
        socket.to(roomId).emit('userLeft', {
          userId,
          message: `${userId} has left the room`
        });

        socket.leave(roomId);
        connectedUsers.delete(userId);
      }
      userSockets.delete(userId);
      console.log(`User ${userId} disconnected from room ${roomId}`);
      break;
    }
  }
};

const routes = {
  '/api/users': userRoutes,
  '/api/billing': billingRoutes,
  '/api/favorite': favoriteRoutes,
  '/api/feedback': feedBackRoutes,
  '/api/token': resetRoutes,
  '/api/items': itemRoutes,
  '/api/auctions': auctionRoutes,
  '/api/payments': paymentRoutes,
  '/api/ad-approvals': adApprovalRoutes,
  '/api/notifications': notificationRoutes,
  '/api/chats': chatRoutes
};

Object.entries(routes).forEach(([path, router]) => {
  app.use(path, router);
});

// Server startup
const startServer = async () => {
  try {
    await connectDB();
    setupSocketIO(io);
    
    const port = 5001;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await mongoose.connection.close();
    server.close(() => {
      console.log('Server shut down gracefully');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();

module.exports = { server, io };
