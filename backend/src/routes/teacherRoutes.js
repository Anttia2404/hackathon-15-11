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

// Class management
router.get('/classes', teacherController.getTeacherClasses);
router.get('/classes/:id/enrollments', teacherController.getClassEnrollments);
router.post('/classes/add-students', teacherController.addStudentsToClass);
router.delete('/enrollments/:enrollment_id', teacherController.removeStudentFromClass);
router.get('/students', teacherController.getAllStudents);

module.exports = router;
