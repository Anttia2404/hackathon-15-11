const express = require('express');
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const teacherRoutes = require('./teacherRoutes');
const quizRoutes = require('./quizRoutes');
const discussionRoutes = require('./discussionRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');
const analyticsRoutes = require('./analytics');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/quizzes', quizRoutes);
router.use('/discussions', discussionRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
