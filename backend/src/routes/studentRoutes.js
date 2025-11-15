const express = require('express');
const studentController = require('../controllers/studentController');
const { authenticate, requireStudent } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and student role
router.use(authenticate);
router.use(requireStudent);

router.get('/dashboard', studentController.getDashboard);
router.get('/deadlines', studentController.getDeadlines);
router.post('/deadlines', studentController.createDeadline);
router.put('/deadlines/:id', studentController.updateDeadline);
router.get('/study-plans', studentController.getStudyPlans);

module.exports = router;
