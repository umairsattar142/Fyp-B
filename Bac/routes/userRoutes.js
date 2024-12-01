const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const validateMiddleware = require('../middlewares/validateMiddleware');
const { validateUserRegistration } = require('../utils/validators');
const UserController = require('../controllers/userController');
const roleMiddleware = require("../middlewares/roleMiddleware")
const tokenController = require("../controllers/tokenController")

// Public routes
router.post('/login', UserController.login);
router.post('/register', validateUserRegistration(), validateMiddleware, UserController.register);
router.post("/verify",UserController.verifyToken)

// Reset Password routes
router.post("/reset/token",tokenController.generateToken)
router.post("/reset/verify",tokenController.verifyToken)
router.post("/reset/set-password",tokenController.updatePassword)

// Protected routes
router.use(authMiddleware);
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

// Admin routes
router.use(roleMiddleware(true));
router.get('/admin/users', UserController.getAllUsers);

module.exports = router;