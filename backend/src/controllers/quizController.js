const { Quiz } = require('../models');

class QuizController {
  // Create AI-generated quiz
  async generateQuiz(req, res) {
    try {
      const teacherId = req.teacher.teacher_id;
      const { title, description, topic, difficulty, num_questions, class_id } = req.body;

      // Mock AI-generated questions (in production, integrate with OpenAI)
      const questions = [];
      for (let i = 0; i < num_questions; i++) {
        questions.push({
          question_text: `Sample AI question ${i + 1} about ${topic}`,
          question_type: 'multiple_choice',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answer: 'Option A',
          explanation: 'AI-generated explanation',
          points: 1.0,
          question_order: i + 1,
        });
      }

      const quiz = await Quiz.create({
        teacher_id: teacherId,
        class_id,
        title,
        description,
        topic,
        difficulty,
        total_questions: num_questions,
        is_ai_generated: true,
      });

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
}

module.exports = new QuizController();
