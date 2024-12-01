// module.exports = {
//   mongoURI: process.env.MONGO_URI||"mongodb+srv://zain:758900zain@rarefinds.lwfxpre.mongodb.net/?retryWrites=true&w=majority", // Replace with your MongoDB connection string
//     jwtSecret: process.env.JWT_SECRET||"NkU7qW!@4yXj8rF2PqZaLc9rGhT3&bVd", // Secret for JWT tokens
//     port: process.env.PORT || 5000 // Port for the server
//   };
  
// config.js
require('dotenv').config();

const config = {
  mongoURI: process.env.MONGO_URI || "mongodb+srv://zain:758900zain@rarefinds.lwfxpre.mongodb.net/?retryWrites=true&w=majority&appName=rarefinds",
  jwtSecret: process.env.JWT_SECRET || "NkU7qW!@4yXj8rF2PqZaLc9rGhT3&bVd",
  port: process.env.PORT || 5000,
  clientURL: process.env.CLIENT_URL || "exp://192.168.0.103:8081",
  dbOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    maxPoolSize: 50,
    minPoolSize: 10
  },
  corsOptions: {
    origin: function(origin, callback) {
      const allowedOrigins = [
        process.env.CLIENT_URL || "exp://192.168.0.103:8081",
        'http://localhost:8081'
      ];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
};

module.exports = config;