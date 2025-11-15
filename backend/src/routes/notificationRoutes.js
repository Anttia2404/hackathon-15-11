const express = require('express');
const router = express.Router();

// In-memory storage for notifications (in production, use database)
let notifications = [];

/**
 * POST /api/v1/notifications/send-message
 * Teacher sends message to all students
 */
router.post('/send-message', async (req, res) => {
  try {
    const { classId, message, teacherName } = req.body;

    const notification = {
      id: Date.now(),
      classId,
      message,
      teacherName: teacherName || 'Giảng viên',
      timestamp: new Date(),
      isRead: false,
    };

    notifications.push(notification);

    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications = notifications.slice(-50);
    }

    res.status(200).json({
      success: true,
      message: 'Đã gửi tin nhắn đến tất cả sinh viên',
      notification,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể gửi tin nhắn',
    });
  }
});

/**
 * GET /api/v1/notifications/student
 * Get all notifications for students
 */
router.get('/student', async (req, res) => {
  try {
    // Filter notifications from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentNotifications = notifications.filter(
      (notif) => new Date(notif.timestamp) > oneDayAgo
    );

    res.status(200).json({
      success: true,
      notifications: recentNotifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải thông báo',
    });
  }
});

module.exports = router;
