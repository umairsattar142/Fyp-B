const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const NotificationController = require('../controllers/notificationController');

// Protected routes
router.use(authMiddleware);

router.post('/', NotificationController.createNotification);
router.get('/', NotificationController.getNotifications);
router.put('/read/:id', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);

module.exports = router;
