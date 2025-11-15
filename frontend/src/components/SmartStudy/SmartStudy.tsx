import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SmartStudy.css';
import {
  Upload,
  FileText,
  Brain,
  Sparkles,
  BookOpen,
  CheckCircle,
  Download,
  Copy,
  Loader2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Star,
  List,
  Layers,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import quizService from '../../services/quizService';

interface QuizQuestion {
  question: string;
  type: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export function SmartStudy() {
  const [step, setStep] = useState<'upload' | 'processing' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [studyMode, setStudyMode] = useState<'quiz' | 'flashcard'>('quiz');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Vui lòng chọn file');
      return;
    }

    setLoading(true);
    setError('');
    setStep('processing');

    try {
      const result = await quizService.analyzeFile(file, parseInt(numQuestions));
      
      // Extract summary and questions from result
      setSummary(result.summary || 'Đã phân tích tài liệu thành công');
      setQuestions(result.questions || []);
      setStep('results');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi phân tích file');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (!showResults) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionIndex]: optionIndex,
      });
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setSummary('');
    setQuestions([]);
    setSelectedAnswers({});
    setShowResults(false);
    setError('');
    setStudyMode('quiz');
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setMasteredCards(new Set());
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex < questions.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    } else {
      setCurrentCardIndex(questions.length - 1);
    }
  };

  const handleMarkMastered = () => {
    const newMastered = new Set(masteredCards);
    if (newMastered.has(currentCardIndex)) {
      newMastered.delete(currentCardIndex);
    } else {
      newMastered.add(currentCardIndex);
    }
    setMasteredCards(newMastered);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Smart Study Assistant
          </h1>
          <p className="text-gray-600">
            Upload tài liệu → Nhận tóm tắt AI → Tạo quiz tự động → Ôn tập thông minh
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="p-8">
                <div className="text-center mb-6">
                  <Upload className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Upload tài liệu học tập</h2>
                  <p className="text-gray-600">
                    Hỗ trợ PDF, PowerPoint, Word, hình ảnh
                  </p>
                </div>

                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn file *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <FileText className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {file ? file.name : 'Click để chọn file hoặc kéo thả vào đây'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Number of Questions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số câu hỏi muốn tạo
                    </label>
                    <select
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="3">3 câu</option>
                      <option value="5">5 câu</option>
                      <option value="10">10 câu</option>
                      <option value="15">15 câu</option>
                    </select>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-lg">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                    className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-lg py-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Phân tích với AI
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Processing */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="p-12 text-center">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">AI đang phân tích tài liệu...</h2>
                <p className="text-gray-600">
                  Đang tạo tóm tắt và câu hỏi từ nội dung của bạn
                </p>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Summary Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">Tóm tắt nội dung</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopySummary}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
                </div>
              </Card>

              {/* Quiz Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Câu hỏi ôn tập</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Mode Selector */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => {
                          setStudyMode('quiz');
                          setShowResults(false);
                          setSelectedAnswers({});
                        }}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                          studyMode === 'quiz'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <List className="w-4 h-4" />
                        Quiz
                      </button>
                      <button
                        onClick={() => {
                          setStudyMode('flashcard');
                          setCurrentCardIndex(0);
                          setIsFlipped(false);
                        }}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                          studyMode === 'flashcard'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                        Flashcard
                      </button>
                    </div>
                    
                    {studyMode === 'quiz' && showResults && (
                      <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-600">
                          {calculateScore().percentage}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {calculateScore().correct}/{calculateScore().total} câu đúng
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {studyMode === 'flashcard' ? (
                  /* Flashcard Mode */
                  <div className="space-y-6">
                    {/* Progress */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        Thẻ {currentCardIndex + 1} / {questions.length}
                      </span>
                      <span>
                        Đã nhớ: {masteredCards.size} / {questions.length}
                      </span>
                    </div>

                    {/* Flashcard */}
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="relative h-96 cursor-pointer perspective-1000"
                    >
                      <motion.div
                        className="w-full h-full relative preserve-3d"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: 'spring' }}
                      >
                        {/* Front - Question */}
                        <div className="absolute inset-0 backface-hidden">
                          <Card className="h-full p-8 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
                            <div className="text-center space-y-4">
                              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto">
                                <Brain className="w-8 h-8 text-white" />
                              </div>
                              <p className="text-2xl font-semibold text-gray-900">
                                {questions[currentCardIndex]?.question}
                              </p>
                              <p className="text-sm text-gray-500">Click để xem đáp án</p>
                            </div>
                          </Card>
                        </div>

                        {/* Back - Answer */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180">
                          <Card className="h-full p-8 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                            <div className="text-center space-y-4">
                              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-white" />
                              </div>
                              <div className="space-y-3">
                                <p className="text-lg font-semibold text-green-900">Đáp án đúng:</p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {questions[currentCardIndex]?.options[questions[currentCardIndex]?.correctAnswer]}
                                </p>
                                {questions[currentCardIndex]?.explanation && (
                                  <div className="mt-4 p-4 bg-white rounded-lg">
                                    <p className="text-sm text-gray-700">
                                      {questions[currentCardIndex]?.explanation}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">Click để quay lại câu hỏi</p>
                            </div>
                          </Card>
                        </div>
                      </motion.div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <Button
                        onClick={handlePrevCard}
                        variant="outline"
                        className="gap-2"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        Trước
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setIsFlipped(!isFlipped)}
                          variant="outline"
                          className="gap-2"
                        >
                          <RotateCw className="w-5 h-5" />
                          Lật thẻ
                        </Button>
                        <Button
                          onClick={handleMarkMastered}
                          variant={masteredCards.has(currentCardIndex) ? 'default' : 'outline'}
                          className={`gap-2 ${
                            masteredCards.has(currentCardIndex)
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : ''
                          }`}
                        >
                          <Star className={`w-5 h-5 ${masteredCards.has(currentCardIndex) ? 'fill-current' : ''}`} />
                          {masteredCards.has(currentCardIndex) ? 'Đã nhớ' : 'Đánh dấu'}
                        </Button>
                      </div>

                      <Button
                        onClick={handleNextCard}
                        variant="outline"
                        className="gap-2"
                      >
                        Sau
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Quiz Mode */
                  <div className="space-y-6">
                    {questions.map((q, qIndex) => (
                    <div key={qIndex} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
                          {qIndex + 1}
                        </span>
                        <p className="font-medium text-gray-900 flex-1">{q.question}</p>
                      </div>

                      <div className="space-y-2 ml-11">
                        {q.options.map((option, oIndex) => {
                          const isSelected = selectedAnswers[qIndex] === oIndex;
                          const isCorrect = q.correctAnswer === oIndex;
                          const showCorrect = showResults && isCorrect;
                          const showWrong = showResults && isSelected && !isCorrect;

                          return (
                            <button
                              key={oIndex}
                              onClick={() => handleAnswerSelect(qIndex, oIndex)}
                              disabled={showResults}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                showCorrect
                                  ? 'border-green-500 bg-green-50'
                                  : showWrong
                                  ? 'border-red-500 bg-red-50'
                                  : isSelected
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-indigo-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {showCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {showResults && q.explanation && (
                        <div className="ml-11 mt-3 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <strong>Giải thích:</strong> {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
                )}

                {studyMode === 'quiz' && (
                  <div className="flex gap-3 mt-6">
                  {!showResults ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(selectedAnswers).length !== questions.length}
                      className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Nộp bài
                    </Button>
                  ) : (
                    <Button
                      onClick={handleReset}
                      className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      <ArrowRight className="w-5 h-5" />
                      Học tài liệu mới
                    </Button>
                  )}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
