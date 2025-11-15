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
 * GET /api/v1/notifications/student/:studentId
 * Get all notifications for a specific student
 */
router.get('/student/:studentId', async (req, res) => {
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

/**
 * POST /api/v1/notifications/request-help
 * Student requests help from teacher
 */
router.post('/request-help', async (req, res) => {
  try {
    const { studentId, studentName, message, studyHealth } = req.body;

    const helpRequest = {
      id: Date.now(),
      studentId,
      studentName: studentName || 'Sinh viên',
      message: message || 'Cần hỗ trợ',
      studyHealth: studyHealth || 0,
      timestamp: new Date(),
      isResolved: false,
    };

    // Store help request (in production, save to database)
    if (!global.helpRequests) {
      global.helpRequests = [];
    }
    global.helpRequests.push(helpRequest);

    res.status(200).json({
      success: true,
      message: 'Đã gửi yêu cầu hỗ trợ',
      helpRequest,
    });
  } catch (error) {
    console.error('Error requesting help:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể gửi yêu cầu',
    });
  }
});

/**
 * GET /api/v1/notifications/help-requests/:classId
 * Get help requests for a class
 */
router.get('/help-requests/:classId', async (req, res) => {
  try {
    const requests = global.helpRequests || [];
    
    // Filter requests from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRequests = requests.filter(
      (req) => new Date(req.timestamp) > oneDayAgo && !req.isResolved
    );

    res.status(200).json({
      success: true,
      requests: recentRequests,
    });
  } catch (error) {
    console.error('Error fetching help requests:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải yêu cầu hỗ trợ',
    });
  }
});

module.exports = router;
