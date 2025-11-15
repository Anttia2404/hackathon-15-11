import { motion } from 'motion/react';
import { FileText, Upload, Sparkles, BookOpen, Brain, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useState } from 'react';

export function AISummary() {
  const [uploadedFile, setUploadedFile] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const summary = {
    title: 'Bài giảng: Trí tuệ nhân tạo - Machine Learning',
    points: [
      'Machine Learning là nhánh của AI cho phép máy tính học từ dữ liệu',
      'Có 3 loại chính: Supervised, Unsupervised, và Reinforcement Learning',
      'Neural Network mô phỏng cách hoạt động của não người',
      'Deep Learning sử dụng nhiều lớp neural network để học các đặc trưng phức tạp',
      'Overfitting xảy ra khi model học quá chi tiết từ training data',
      'Cross-validation giúp đánh giá độ chính xác của model',
    ],
    keyInsights: [
      'Training data chất lượng quan trọng hơn thuật toán',
      'Feature engineering là bước quan trọng nhất',
      'Regularization giúp tránh overfitting',
    ]
  };

  const flashcards = [
    { front: 'Machine Learning là gì?', back: 'Là nhánh của AI cho phép máy tính học từ dữ liệu mà không cần lập trình cụ thể từng bước' },
    { front: 'Supervised Learning là gì?', back: 'Là phương pháp học có giám sát, model học từ dữ liệu có nhãn (labeled data)' },
    { front: 'Neural Network là gì?', back: 'Là mô hình tính toán mô phỏng cách hoạt động của não người, gồm các lớp neurons kết nối với nhau' },
    { front: 'Overfitting là gì?', back: 'Là hiện tượng model học quá chi tiết từ training data, dẫn đến kết quả kém trên test data' },
  ];

  const quizQuestions = [
    {
      question: 'Machine Learning thuộc lĩnh vực nào?',
      options: ['Data Science', 'Artificial Intelligence', 'Web Development', 'Database Management'],
      correct: 1
    },
    {
      question: 'Phương pháp nào yêu cầu labeled data?',
      options: ['Unsupervised Learning', 'Supervised Learning', 'Reinforcement Learning', 'Tất cả đều sai'],
      correct: 1
    },
    {
      question: 'Deep Learning sử dụng cấu trúc gì?',
      options: ['Decision Tree', 'Linear Regression', 'Neural Network nhiều lớp', 'K-means Clustering'],
      correct: 2
    },
    {
      question: 'Overfitting có thể giải quyết bằng cách nào?',
      options: ['Tăng training data', 'Regularization', 'Cross-validation', 'Tất cả đều đúng'],
      correct: 3
    },
    {
      question: 'Yếu tố nào quan trọng nhất trong ML?',
      options: ['Thuật toán phức tạp', 'Dữ liệu chất lượng', 'Máy tính mạnh', 'IDE hiện đại'],
      correct: 1
    },
  ];

  const handleFlashcardNext = () => {
    setCurrentFlashcard((prev) => (prev + 1) % flashcards.length);
  };

  const handleFlashcardPrev = () => {
    setCurrentFlashcard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuiz] = answerIndex;
    setQuizAnswers(newAnswers);
    
    if (currentQuiz < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuiz(currentQuiz + 1), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-purple-600" />
            <h1 className="text-gray-900">AI Summary</h1>
          </div>
          <p className="text-gray-600">Upload tài liệu, nhận tóm tắt, flashcard và quiz tự động</p>
        </motion.div>

        {/* Upload Section */}
        {!uploadedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="mb-2 text-gray-900">Upload tài liệu học tập</h3>
              <p className="text-gray-600 mb-6">
                Hỗ trợ PDF, PNG, JPG. AI sẽ tự động phân tích và tạo nội dung học tập
              </p>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setUploadedFile(true)}
              >
                <Upload className="mr-2 w-4 h-4" />
                Chọn file hoặc kéo thả vào đây
              </Button>
              <p className="text-gray-500 mt-4">Tối đa 10MB</p>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Summary Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="text-gray-900">Tóm tắt nội dung</h3>
                </div>
                
                <div className="mb-4 p-4 bg-purple-50 rounded-xl">
                  <div className="text-gray-900 mb-2">{summary.title}</div>
                </div>

                <ul className="space-y-3">
                  {summary.points.map((point, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            {/* Key Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="text-gray-900">Key Insights from AI</h3>
                </div>
                
                <div className="space-y-2">
                  {summary.keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg">
                      <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{insight}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Flashcards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-pink-600" />
                  <h3 className="text-gray-900">Flashcards</h3>
                  <span className="ml-auto text-gray-500">
                    {currentFlashcard + 1} / {flashcards.length}
                  </span>
                </div>

                <div className="relative">
                  <div className="h-64 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 text-white flex flex-col justify-between">
                    <div>
                      <div className="mb-4">Câu hỏi</div>
                      <div className="text-2xl mb-4">{flashcards[currentFlashcard].front}</div>
                    </div>
                    <div className="border-t border-white/20 pt-4">
                      <div className="mb-2 opacity-75">Trả lời</div>
                      <div>{flashcards[currentFlashcard].back}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={handleFlashcardPrev}
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Trước
                    </Button>
                    <div className="flex gap-2">
                      {flashcards.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentFlashcard ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleFlashcardNext}
                      className="gap-2"
                    >
                      Sau
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quiz */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-gray-900">Quiz tự động</h3>
                  <span className="ml-auto text-gray-500">
                    Câu {currentQuiz + 1} / {quizQuestions.length}
                  </span>
                </div>

                <div className="mb-6">
                  <div className="text-gray-900 mb-4 text-xl">
                    {quizQuestions[currentQuiz].question}
                  </div>
                  <div className="space-y-3">
                    {quizQuestions[currentQuiz].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          quizAnswers[currentQuiz] === index
                            ? index === quizQuestions[currentQuiz].correct
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {quizAnswers[currentQuiz] === index && (
                            index === quizQuestions[currentQuiz].correct ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-red-600" />
                            )
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div className="flex gap-2">
                  {quizQuestions.map((_, index) => (
                    <div
                      key={index}
                      className={`flex-1 h-2 rounded-full ${
                        index < currentQuiz
                          ? quizAnswers[index] === quizQuestions[index].correct
                            ? 'bg-green-500'
                            : 'bg-red-500'
                          : index === currentQuiz
                          ? 'bg-blue-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {currentQuiz === quizQuestions.length - 1 && quizAnswers[currentQuiz] !== undefined && (
                  <div className="mt-6 p-4 bg-green-50 rounded-xl text-center">
                    <div className="text-green-700 mb-2">
                      Điểm số: {quizAnswers.filter((ans, i) => ans === quizQuestions[i].correct).length}/{quizQuestions.length}
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Làm lại quiz
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
