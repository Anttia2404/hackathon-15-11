const { Quiz } = require('../models');
const geminiAIService = require('../services/geminiAIService');

class QuizController {
  // Create AI-generated quiz
  async generateQuiz(req, res) {
    try {
      const teacherId = req.teacher.teacher_id;
      const { title, description, topic, difficulty, num_questions, class_id } = req.body;

      // Validate input
      if (!topic || !num_questions) {
        return res.status(400).json({ message: 'Topic and num_questions are required' });
      }

      // Generate questions using Gemini AI
      console.log(
        `Generating ${num_questions} questions about "${topic}" with difficulty: ${difficulty}`
      );

      const questions = await geminiAIService.generateQuizQuestions(
        topic,
        difficulty || 'medium',
        parseInt(num_questions),
        description
      );

      const quiz = await Quiz.create({
        teacher_id: teacherId,
        class_id,
        title: title || `Quiz về ${topic}`,
        description,
        topic,
        difficulty: difficulty || 'medium',
        total_questions: num_questions,
        is_ai_generated: true,
      });

      console.log(`✅ Generated ${questions.length} questions successfully`);

      res.status(201).json({
        message: 'Quiz generated successfully',
        quiz,
        questions,
      });
    } catch (error) {
      console.error('Generate quiz error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get quiz by ID
  async getQuiz(req, res) {
    try {
      const { id } = req.params;

      const quiz = await Quiz.findByPk(id);

      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      res.json({ quiz });
    } catch (error) {
      console.error('Get quiz error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get teacher's quizzes
  async getTeacherQuizzes(req, res) {
    try {
      const teacherId = req.teacher.teacher_id;

      const quizzes = await Quiz.findAll({
        where: { teacher_id: teacherId },
        order: [['created_at', 'DESC']],
      });

      res.json({ quizzes });
    } catch (error) {
      console.error('Get teacher quizzes error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Generate quiz from uploaded file
  async generateQuizFromFile(req, res) {
    try {
      const teacherId = req.teacher.teacher_id;

      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng upload file' });
      }

      const { difficulty, num_questions, title, class_id } = req.body;
      const numQ = parseInt(num_questions) || 5;

      console.log(`Analyzing file: ${req.file.originalname} (${req.file.mimetype})`);

      // Use Gemini Vision to analyze file and generate quiz
      const questions = await geminiAIService.analyzeFileAndGenerateQuiz(
        req.file.buffer,
        req.file.mimetype,
        difficulty || 'medium',
        numQ
      );

      // Extract topic from filename
      const topic = req.file.originalname.replace(/\.[^/.]+$/, '');

      const quiz = await Quiz.create({
        teacher_id: teacherId,
        class_id,
        title: title || `Quiz từ ${req.file.originalname}`,
        description: `Quiz được tạo tự động từ file: ${req.file.originalname}`,
        topic,
        difficulty: difficulty || 'medium',
        total_questions: questions.length,
        is_ai_generated: true,
      });

      console.log(`✅ Generated ${questions.length} questions from file`);

      res.status(201).json({
        message: 'Quiz generated successfully from file',
        quiz,
        questions,
      });
    } catch (error) {
      console.error('Generate quiz from file error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Analyze file for students (no quiz saved to DB)
  async analyzeFileForStudents(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng upload file' });
      }

      const { difficulty, num_questions } = req.body;
      const numQ = parseInt(num_questions) || 5;

      console.log(`Analyzing file for student: ${req.file.originalname}`);

      // Use Gemini Vision to analyze file and generate summary + questions
      const result = await geminiAIService.analyzeFileWithSummary(
        req.file.buffer,
        req.file.mimetype,
        difficulty || 'medium',
        numQ
      );

      console.log(`✅ Generated summary and ${result.questions.length} questions from file`);

      // Don't save to DB, just return summary and questions
      res.status(200).json({
        message: 'File analyzed successfully',
        summary: result.summary,
        questions: result.questions,
        fileName: req.file.originalname,
      });
    } catch (error) {
      console.error('Analyze file error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = new QuizController();
