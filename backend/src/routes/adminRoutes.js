const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Classes management
router.get('/classes', adminController.getAllClasses);
router.post('/classes', adminController.createClass);
router.put('/classes/:id', adminController.updateClass);
router.delete('/classes/:id', adminController.deleteClass);
router.get('/classes/:id/enrollments', adminController.getClassEnrollments);

// Teachers management
router.get('/teachers', adminController.getAllTeachers);

// Students management
router.get('/students', adminController.getAllStudents);
router.post('/classes/add-students', adminController.addStudentsToClass);
router.delete('/enrollments/:enrollment_id', adminController.removeStudentFromClass);

// Courses
router.get('/courses', adminController.getAllCourses);

module.exports = router;
