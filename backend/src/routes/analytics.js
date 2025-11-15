const express = require('express');
const router = express.Router();
const studyHealthController = require('../controllers/studyHealthController');
const teacherAnalyticsController = require('../controllers/teacherAnalyticsController');

// Student Analytics Routes
router.get('/study-health/:studentId', studyHealthController.calculateStudyHealthScore);
router.get('/optimal-time/:studentId', studyHealthController.getOptimalStudyTime);
router.get('/dashboard/:studentId', studyHealthController.getStudentDashboard);

// Teacher Analytics Routes
router.get('/class/:classId', teacherAnalyticsController.getClassAnalytics);
router.post('/reminder', teacherAnalyticsController.generateReminder);

module.exports = router;
