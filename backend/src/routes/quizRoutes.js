const express = require('express');
const quizController = require('../controllers/quizController');
const { authenticate, requireTeacher } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);

// Increase timeout for AI generation (2 minutes)
const increaseTimeout = (req, res, next) => {
  req.setTimeout(120000); // 120 seconds
  res.setTimeout(120000);
  next();
};

router.post('/generate', requireTeacher, increaseTimeout, quizController.generateQuiz);
router.post(
  '/generate-from-file',
  requireTeacher,
  increaseTimeout,
  upload.single('file'),
  quizController.generateQuizFromFile
);
// Public endpoint for students to analyze files (no quiz saved to DB)
router.post(
  '/analyze-file',
  increaseTimeout,
  upload.single('file'),
  quizController.analyzeFileForStudents
);
router.get('/teacher', requireTeacher, quizController.getTeacherQuizzes);
router.get('/:id', quizController.getQuiz);

module.exports = router;
