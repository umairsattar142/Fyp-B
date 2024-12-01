const { body } = require('express-validator');

// User registration validation
const validateUserRegistration = () => [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .notEmpty()
    .withMessage('Name is required'),
];

// User login validation
const validateUserLogin = () => [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Item creation validation
const validateItemCreation = () => [
  body('title')
    .notEmpty()
    .withMessage('Title is required'),
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
  body('startingPrice')
    .isFloat({ gt: 0 })
    .withMessage('Starting price must be a positive number'),
];

// Auction bid validation
const validateBid = () => [
  body('auctionId')
    .notEmpty()
    .withMessage('Auction ID is required'),
  body('bidAmount')
    .isFloat({ gt: 0 })
    .withMessage('Bid amount must be a positive number'),
];

// Payment processing validation
const validatePayment = () => [
  body('auctionId')
    .notEmpty()
    .withMessage('Auction ID is required'),
  body('paymentAmount')
    .isFloat({ gt: 0 })
    .withMessage('Payment amount must be a positive number'),
];

// Ad approval validation
const validateAdApproval = () => [
  body('adId')
    .notEmpty()
    .withMessage('Ad ID is required'),
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateItemCreation,
  validateBid,
  validatePayment,
  validateAdApproval,
};
