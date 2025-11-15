const express = require('express');
const teacherController = require('../controllers/teacherController');
const { authenticate, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and teacher role
router.use(authenticate);
router.use(requireTeacher);

router.get('/dashboard', teacherController.getDashboard);
router.get('/at-risk-students', teacherController.getAtRiskStudents);
router.post('/attendance', teacherController.markAttendance);

module.exports = router;
