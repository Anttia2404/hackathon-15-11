const express = require('express');
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const teacherRoutes = require('./teacherRoutes');
const quizRoutes = require('./quizRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const timetableRoutes = require('./timetableRoutes');
const deadlineRoutes = require('./deadlineRoutes');
const studyPlanRoutes = require('./studyPlanRoutes');
const preferencesRoutes = require('./preferencesRoutes');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/quizzes', quizRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/timetable', timetableRoutes);
router.use('/deadlines', deadlineRoutes);
router.use('/study-plans', studyPlanRoutes);
router.use('/preferences', preferencesRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
