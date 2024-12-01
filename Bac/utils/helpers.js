const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '48h' });
};

// Validate Email
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Hash Password (Example with bcrypt)
const bcrypt = require('bcryptjs');
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};
const comparePassword = async (password,passwordHash)=>{
  const result = await bcrypt.compare(password,passwordHash)
  return result
}


const generateVerificationToken=()=>{
  // Generate a random token
  const token = Math.floor(10000*Math.random()+999999);
  return token;
}

module.exports = {
  generateVerificationToken,
  generateToken,
  isValidEmail,
  hashPassword,
  comparePassword

};
