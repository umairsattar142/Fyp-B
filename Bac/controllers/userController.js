const User = require('../models/userModel');
const { generateToken, hashPassword, comparePassword } = require('../utils/helpers');
const { STATUS_CODES, MESSAGE, DEFAULT_PROFILE } = require('../utils/constants');
const Token = require("../models/tokenModal");
const { sendVerificationToken } = require('../utils/email-service');

const getToken = () => {
  return Math.floor(100000 + Math.random() * 900000);
}
// Register a new user
const register = async (req, res) => {
  const { email, contact, password, cnic, name, profileImage, isAdmin } = req.body;

  if (!email || !password || !contact || !cnic || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      email,
      password: hashedPassword,
      contact,
      cnic,
      name,
      profileImage: profileImage || DEFAULT_PROFILE,
      isAdmin: isAdmin || false
    });
    const token = getToken()
    await new Token({ email, token }).save()
    await sendVerificationToken(email, token)
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

// User login
const login = async (req, res) => {
  const { cnic, password } = req.body;

  try {
    const user = await User.findOne({ cnic, isVerified: true });
    console.log(cnic, password, user)
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(400).json({ message: 'Invalid cnic or password' });
    }
    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Get user profile
const getProfile = (req, res) => {
  res.status(200).json(req.user);
};

// Update user profile
const updateProfile = async (req, res) => {
  const { name, profileImage, cnic, email, contact, password } = req.body;

  try {
    email != "" && (req.user.email = email || req.user.email)
    contact != "" && (req.user.contact = contact || req.user.contact)
    password != "" && (req.user.password = await hashPassword(password) || req.user.password)
    cnic != "" && (req.user.cnic = cnic || req.user.cnic)
    name != "" && (req.user.name = name || req.user.name)
    profileImage != "" && (req.user.profileImage = profileImage || req.user.profileImage)
    await req.user.save();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};
const verifyToken = async (req, res) => {
  try {
    const { token, email } = req.body
    if (!token || !email) {
      res.status(400).json({ message: "Token or email is missing" })
    }
    const foundToken = await Token.findOne({ token, email })
    await User.findOneAndUpdate({ email }, { $set: { isVerified: true } })
    await foundToken.deleteOne()
    res.status(200).json({ message: "User verified successfully" })
  } catch (error) {
    res.status(500).json({ message: "server error" })
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  verifyToken
};
