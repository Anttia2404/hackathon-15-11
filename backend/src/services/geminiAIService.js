const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not found. AI features will not work.');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      // Use correct model names (as of Nov 2024)
      this.modelNames = ['gemini-2.0-flash', 'gemini-1.5-pro'];
      console.log(`✅ Gemini AI initialized with models: ${this.modelNames.join(', ')}`);
    }
  }

  async generateQuizQuestions(topic, difficulty, numQuestions, description) {
    if (!this.genAI) {
      throw new Error('Gemini AI chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env');
    }

    let lastError = null;

    // Try each model until one works
    for (const modelName of this.modelNames) {
      try {
        console.log(`🧪 Trying model: ${modelName}`);
        const model = this.genAI.getGenerativeModel({ model: modelName });

        const prompt = this.buildQuizPrompt(topic, difficulty, numQuestions, description);
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON response from Gemini
        const questions = this.parseGeminiResponse(text, numQuestions);

        console.log(`✅ Successfully generated quiz with model: ${modelName}`);
        return questions;
      } catch (error) {
        console.error(`❌ Model ${modelName} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    // All models failed
    throw new Error(`Không thể tạo quiz với Gemini AI. Chi tiết: ${lastError?.message}`);
  }

  async analyzeFileAndGenerateQuiz(fileBuffer, mimeType, difficulty, numQuestions) {
    if (!this.genAI) {
      throw new Error('Gemini AI chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env');
    }

    let lastError = null;

    // Try vision models for file analysis
    const visionModels = ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];

    for (const modelName of visionModels) {
      try {
        console.log(`🧪 Trying vision model: ${modelName}`);
        const model = this.genAI.getGenerativeModel({ model: modelName });

        // Convert buffer to base64
        const base64Data = fileBuffer.toString('base64');

        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        };

        const prompt = `Phân tích nội dung tài liệu này và tạo ${numQuestions} câu hỏi trắc nghiệm.

Yêu cầu:
- Độ khó: ${difficulty || 'trung bình'}
- Mỗi câu hỏi có 4 đáp án
- Chỉ có 1 đáp án đúng
- Có giải thích chi tiết

QUAN TRỌNG: "correct_answer" PHẢI là text CHÍNH XÁC của một trong các đáp án trong mảng "options" (sao chép y hệt).

Trả về JSON array với format:
[
  {
    "question_text": "Câu hỏi?",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correct_answer": "Đáp án B",
    "explanation": "Giải thích"
  }
]`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const text = response.text();

        // Parse JSON response
        const questions = this.parseGeminiResponse(text, numQuestions);

        console.log(`✅ Successfully analyzed file with model: ${modelName}`);
        return questions;
      } catch (error) {
        console.error(`❌ Model ${modelName} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    throw new Error(`Không thể phân tích file. Chi tiết: ${lastError?.message}`);
  }

  async analyzeFileWithSummary(fileBuffer, mimeType, difficulty, numQuestions) {
    if (!this.genAI) {
      throw new Error('Gemini AI chưa được khởi tạo');
    }

    const visionModels = ['gemini-2.0-flash', 'gemini-1.5-pro'];
    let lastError;

    for (const modelName of visionModels) {
      try {
        console.log(`🧪 Trying vision model for summary: ${modelName}`);

        const model = this.genAI.getGenerativeModel({ model: modelName });

        const prompt = `Phân tích tài liệu này và thực hiện 2 nhiệm vụ:

1. TÓM TẮT: Viết một đoạn tóm tắt ngắn gọn (3-5 câu) về nội dung chính của tài liệu.

2. CÂU HỎI: Tạo ${numQuestions} câu hỏi trắc nghiệm từ nội dung tài liệu.

Trả về theo định dạng JSON:
{
  "summary": "Đoạn tóm tắt ở đây...",
  "questions": [
    {
      "question": "Câu hỏi?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "explanation": "Giải thích"
    }
  ]
}`;

        const imagePart = {
          inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType: mimeType,
          },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text();

        // Parse response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Invalid response format');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        
        // Format questions
        const questions = parsed.questions.map((q, index) => {
          let correctAnswer = q.correct_answer;
          const options = q.options || [];

          // Find correct answer index
          const matchIndex = options.findIndex(
            opt => opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
          );

          if (matchIndex !== -1) {
            correctAnswer = matchIndex;
          } else {
            correctAnswer = 0;
          }

          return {
            question: q.question,
            type: 'multiple_choice',
            options: options,
            correctAnswer: correctAnswer,
            explanation: q.explanation || '',
            points: 1,
            order: index + 1,
          };
        });

        console.log(`✅ Successfully analyzed file with summary using model: ${modelName}`);

        return {
          summary: parsed.summary || 'Đã phân tích tài liệu thành công.',
          questions: questions,
        };
      } catch (error) {
        console.error(`❌ Model ${modelName} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    throw new Error(`Không thể phân tích file. Chi tiết: ${lastError?.message}`);
  }

  buildQuizPrompt(topic, difficulty, numQuestions, description) {
    const difficultyMap = {
      easy: 'dễ, phù hợp cho người mới bắt đầu',
      medium: 'trung bình, yêu cầu hiểu biết cơ bản',
      hard: 'khó, yêu cầu kiến thức chuyên sâu',
      mixed: 'hỗn hợp các mức độ từ dễ đến khó',
    };

    return `Bạn là một giảng viên chuyên nghiệp. Hãy tạo ${numQuestions} câu hỏi trắc nghiệm về chủ đề "${topic}".

Yêu cầu:
- Độ khó: ${difficultyMap[difficulty] || 'trung bình'}
${description ? `- Mô tả thêm: ${description}` : ''}
- Mỗi câu hỏi có 4 đáp án
- Chỉ có 1 đáp án đúng
- Có giải thích chi tiết cho đáp án đúng

QUAN TRỌNG: "correct_answer" PHẢI là text CHÍNH XÁC của một trong các đáp án trong mảng "options" (sao chép y hệt, bao gồm cả khoảng trắng và dấu câu).

Trả về kết quả dưới dạng JSON array với format sau (chỉ trả về JSON, không thêm text khác):
[
  {
    "question_text": "Câu hỏi ở đây?",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correct_answer": "Đáp án B",
    "explanation": "Giải thích tại sao đáp án B đúng"
  }
]`;
  }

  parseGeminiResponse(text, numQuestions) {
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim();
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const parsed = JSON.parse(cleanText);

      // Ensure it's an array and format correctly
      const questions = (Array.isArray(parsed) ? parsed : [parsed]).slice(0, numQuestions);

      return questions.map((q, index) => {
        const options = Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'];
        let correctAnswer = q.correct_answer || options[0];

        // Try to find exact match first
        let foundInOptions = options.includes(correctAnswer);

        // If not found, try case-insensitive and trimmed match
        if (!foundInOptions) {
          const normalized = correctAnswer.trim().toLowerCase();
          const matchIndex = options.findIndex(opt => opt.trim().toLowerCase() === normalized);

          if (matchIndex !== -1) {
            correctAnswer = options[matchIndex]; // Use the exact option text
          } else {
            console.warn(
              `⚠️  Question ${index + 1}: correct_answer "${correctAnswer}" not found in options:`,
              options
            );
            correctAnswer = options[0]; // Fallback to first option
          }
        }

        return {
          question_text: q.question_text || q.question || 'Câu hỏi không hợp lệ',
          question_type: 'multiple_choice',
          options: options,
          correct_answer: correctAnswer,
          explanation: q.explanation || 'Không có giải thích',
          points: this.getPointsByDifficulty('medium'),
          question_order: index + 1,
        };
      });
    } catch (error) {
      console.error('Failed to parse Gemini response:', error.message);
      console.log('Raw response:', text);
      throw new Error('Invalid AI response format');
    }
  }

  generateFallbackQuestions(topic, difficulty, numQuestions) {
    console.log(`⚠️  Generating smart fallback questions for topic: "${topic}"`);
    const questions = [];

    // Smart question templates based on topic
    const questionTemplates = [
      {
        text: `${topic} là gì?`,
        options: [
          `Một khái niệm trong khoa học tự nhiên`,
          `Một chủ đề quan trọng trong giáo dục`,
          `Một lĩnh vực nghiên cứu chuyên sâu`,
          `Tất cả các đáp án trên`,
        ],
        correctIndex: 3,
        explanation: `${topic} là một chủ đề rộng lớn với nhiều khía cạnh khác nhau trong giáo dục.`,
      },
      {
        text: `Tầm quan trọng của ${topic} là gì?`,
        options: [
          `Giúp phát triển kỹ năng tư duy`,
          `Cung cấp kiến thức nền tảng`,
          `Ứng dụng thực tế trong cuộc sống`,
          `Tất cả các đáp án trên`,
        ],
        correctIndex: 3,
        explanation: `${topic} đóng vai trò quan trọng trong việc phát triển toàn diện kiến thức và kỹ năng.`,
      },
      {
        text: `Phương pháp học ${topic} hiệu quả nhất là gì?`,
        options: [
          `Học thuộc lòng`,
          `Thực hành thường xuyên và tư duy logic`,
          `Chỉ đọc sách giáo khoa`,
          `Không cần học, tự biết`,
        ],
        correctIndex: 1,
        explanation: `Thực hành thường xuyên kết hợp với tư duy logic giúp hiểu sâu về ${topic}.`,
      },
      {
        text: `Ứng dụng thực tế của ${topic} là gì?`,
        options: [
          `Trong nghiên cứu khoa học`,
          `Trong đời sống hàng ngày`,
          `Trong công việc chuyên môn`,
          `Tất cả các đáp án trên`,
        ],
        correctIndex: 3,
        explanation: `${topic} có ứng dụng rộng rãi trong nhiều lĩnh vực của cuộc sống.`,
      },
      {
        text: `Để nắm vững ${topic}, cần có điều kiện gì?`,
        options: [
          `Chỉ cần thông minh`,
          `Kiên trì, chăm chỉ và phương pháp đúng đắn`,
          `Không cần điều kiện gì`,
          `Chỉ cần thầy cô giỏi`,
        ],
        correctIndex: 1,
        explanation: `Sự kiên trì, chăm chỉ và phương pháp học đúng đắn là chìa khóa để thành công với ${topic}.`,
      },
      {
        text: `Thách thức lớn nhất khi học ${topic} là gì?`,
        options: [
          `Khối lượng kiến thức quá nhiều`,
          `Khó hiểu các khái niệm trừu tượng`,
          `Thiếu động lực và sự kiên trì`,
          `Tất cả các đáp án trên`,
        ],
        correctIndex: 3,
        explanation: `Học ${topic} đòi hỏi vượt qua nhiều thách thức về kiến thức, tư duy và động lực.`,
      },
      {
        text: `Kỹ năng nào cần thiết để học tốt ${topic}?`,
        options: [
          `Kỹ năng ghi nhớ`,
          `Kỹ năng tư duy phản biện`,
          `Kỹ năng giải quyết vấn đề`,
          `Tất cả các đáp án trên`,
        ],
        correctIndex: 3,
        explanation: `${topic} yêu cầu sự kết hợp của nhiều kỹ năng để học hiệu quả.`,
      },
      {
        text: `Tài liệu nào phù hợp để học ${topic}?`,
        options: [
          `Sách giáo khoa và tài liệu chính thống`,
          `Bài giảng video trực tuyến`,
          `Bài tập thực hành và đề thi`,
          `Tất cả các đáp án trên`,
        ],
        correctIndex: 3,
        explanation: `Kết hợp đa dạng tài liệu giúp tiếp cận ${topic} từ nhiều góc độ khác nhau.`,
      },
      {
        text: `Thời gian phù hợp để học ${topic} là?`,
        options: [
          `Chỉ trước khi thi`,
          `Đều đặn mỗi ngày`,
          `Khi nào rảnh thì học`,
          `Không cần học thường xuyên`,
        ],
        correctIndex: 1,
        explanation: `Học ${topic} đều đặn mỗi ngày giúp ghi nhớ tốt hơn và hiểu sâu hơn.`,
      },
      {
        text: `Làm thế nào để duy trì động lực học ${topic}?`,
        options: [
          `Đặt mục tiêu rõ ràng`,
          `Khen thưởng bản thân khi đạt tiến bộ`,
          `Tham gia nhóm học tập`,
          `Tất cả các đáp án trên`,
        ],
        correctIndex: 3,
        explanation: `Duy trì động lực học ${topic} cần nhiều yếu tố hỗ trợ khác nhau.`,
      },
    ];

    // Generate questions
    for (let i = 0; i < numQuestions; i++) {
      const template = questionTemplates[i % questionTemplates.length];

      questions.push({
        question_text: template.text,
        question_type: 'multiple_choice',
        options: template.options,
        correct_answer: template.options[template.correctIndex],
        explanation: template.explanation,
        points: this.getPointsByDifficulty(difficulty),
        question_order: i + 1,
      });
    }

    return questions;
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

  async testConnection() {
    if (!this.genAI) {
      return { success: false, message: 'API key not configured' };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent('Hello, are you working?');
      const response = result.response;
      const text = response.text();
      return { success: true, message: 'Gemini AI connected successfully', response: text };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

}

module.exports = new GeminiAIService();
