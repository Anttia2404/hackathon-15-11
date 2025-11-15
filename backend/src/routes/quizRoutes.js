const express = require('express');
const quizController = require('../controllers/quizController');
const { authenticate, requireTeacher } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/generate', requireTeacher, quizController.generateQuiz);
router.get('/teacher', requireTeacher, quizController.getTeacherQuizzes);
router.get('/:id', quizController.getQuiz);

module.exports = router;
