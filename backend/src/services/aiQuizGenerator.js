/**
 * AI Quiz Generator Service
 * Generates quiz questions based on topic and difficulty
 * This is a mock AI service - in production, integrate with OpenAI/Claude API
 */

class AIQuizGenerator {
  constructor() {
    this.templates = {
      easy: {
        starters: ['Khái niệm', 'Định nghĩa', 'Giải thích'],
        formats: [
          '{topic} là gì?',
          'Chức năng chính của {topic} là gì?',
          'Tại sao {topic} quan trọng?',
        ],
      },
      medium: {
        starters: ['So sánh', 'Phân tích', 'Ứng dụng'],
        formats: [
          'So sánh {topic} với các phương pháp khác',
          'Ưu điểm và nhược điểm của {topic}',
          'Khi nào nên sử dụng {topic}?',
        ],
      },
      hard: {
        starters: ['Đánh giá', 'Thiết kế', 'Tối ưu'],
        formats: [
          'Làm thế nào để tối ưu hóa {topic}?',
          'Thiết kế hệ thống sử dụng {topic}',
          'Giải quyết vấn đề phức tạp với {topic}',
        ],
      },
    };

    this.topicKnowledge = {
      'machine learning': {
        concepts: [
          'supervised learning',
          'unsupervised learning',
          'neural networks',
          'overfitting',
          'regularization',
        ],
        questions: [
          {
            question: 'Machine Learning là gì?',
            options: [
              'Phương pháp lập trình truyền thống',
              'Nhánh của AI cho phép máy tính học từ dữ liệu',
              'Ngôn ngữ lập trình mới',
              'Hệ điều hành cho AI',
            ],
            correct: 1,
            explanation:
              'Machine Learning là nhánh của AI tập trung vào việc xây dựng các thuật toán có khả năng học từ dữ liệu và cải thiện hiệu suất theo thời gian.',
          },
          {
            question: 'Supervised Learning yêu cầu điều kiện gì?',
            options: [
              'Dữ liệu không có nhãn',
              'Dữ liệu có nhãn (labeled data)',
              'Không cần dữ liệu',
              'Chỉ cần thuật toán',
            ],
            correct: 1,
            explanation:
              'Supervised Learning cần dữ liệu được gán nhãn để model có thể học mối quan hệ giữa input và output.',
          },
          {
            question: 'Overfitting là hiện tượng gì?',
            options: [
              'Model học quá tốt trên training data nhưng kém trên test data',
              'Model không học được gì',
              'Model học quá nhanh',
              'Model có quá ít parameters',
            ],
            correct: 0,
            explanation:
              'Overfitting xảy ra khi model học quá chi tiết từ training data, bao gồm cả nhiễu, dẫn đến hiệu suất kém trên dữ liệu mới.',
          },
        ],
      },
      database: {
        concepts: ['SQL', 'NoSQL', 'normalization', 'indexing', 'transactions'],
        questions: [
          {
            question: 'SQL là viết tắt của gì?',
            options: [
              'Standard Query Language',
              'Structured Query Language',
              'Simple Query Language',
              'System Query Language',
            ],
            correct: 1,
            explanation:
              'SQL (Structured Query Language) là ngôn ngữ chuẩn để quản lý và thao tác với cơ sở dữ liệu quan hệ.',
          },
          {
            question: 'Normalization trong database có mục đích gì?',
            options: [
              'Tăng tốc độ truy vấn',
              'Giảm dư thừa dữ liệu',
              'Tăng dung lượng lưu trữ',
              'Tạo backup tự động',
            ],
            correct: 1,
            explanation:
              'Normalization là quá trình tổ chức dữ liệu để giảm thiểu dư thừa và đảm bảo tính toàn vẹn dữ liệu.',
          },
        ],
      },
    };
  }

  async generateQuestions(topic, difficulty, numQuestions, description) {
    const topicLower = topic.toLowerCase();
    const questions = [];

    // Check if we have pre-defined questions for this topic
    const knowledgeBase =
      this.topicKnowledge[topicLower] || this.topicKnowledge['machine learning'];

    // Generate questions based on difficulty
    for (let i = 0; i < numQuestions; i++) {
      if (i < knowledgeBase.questions.length) {
        // Use pre-defined questions
        const q = knowledgeBase.questions[i];
        questions.push({
          question_text: q.question,
          question_type: 'multiple_choice',
          options: q.options,
          correct_answer: q.options[q.correct],
          explanation: q.explanation,
          points: this.getPointsByDifficulty(difficulty),
          question_order: i + 1,
        });
      } else {
        // Generate new questions using templates
        const template = this.templates[difficulty] || this.templates.medium;
        const format = template.formats[i % template.formats.length];
        const questionText = format.replace('{topic}', topic);

        questions.push({
          question_text: questionText,
          question_type: 'multiple_choice',
          options: this.generateOptions(topic, difficulty),
          correct_answer: this.generateOptions(topic, difficulty)[0],
          explanation: `Đây là câu hỏi về ${topic} với độ khó ${difficulty}. ${description || ''}`,
          points: this.getPointsByDifficulty(difficulty),
          question_order: i + 1,
        });
      }
    }

    return questions;
  }

  generateOptions(topic, difficulty) {
    const options = [
      `${topic} được áp dụng trong trường hợp này`,
      `Không sử dụng ${topic}`,
      `${topic} kết hợp với phương pháp khác`,
      `Tất cả các đáp án trên`,
    ];

    return options;
  }

  getPointsByDifficulty(difficulty) {
    const points = {
      easy: 1.0,
      medium: 2.0,
      hard: 3.0,
      mixed: 2.0,
    };
    return points[difficulty] || 1.0;
  }

  // Simulate AI generation delay
  async simulateAIProcessing() {
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}

module.exports = new AIQuizGenerator();
