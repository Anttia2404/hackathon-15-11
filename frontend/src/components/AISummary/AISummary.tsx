import { motion } from "motion/react";
import {
  FileText,
  Upload,
  Sparkles,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useState } from "react";
import quizService from "../../services/quizService";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface Summary {
  title: string;
  points: string[];
  keyInsights: string[];
}

interface Flashcard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export function AISummary() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showFlashcardBack, setShowFlashcardBack] = useState(false);

  // Quiz Generation Form
  const [quizTopic, setQuizTopic] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState<
    "easy" | "medium" | "hard" | "mixed"
  >("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState("");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Chỉ hỗ trợ file PDF, PNG, JPG");
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File quá lớn. Tối đa 10MB");
      return;
    }

    setFile(selectedFile);
    setError("");

    // TODO: Call API to process file
    await processFile(selectedFile);
  };

  const processFile = async (file: File) => {
    setLoading(true);
    setError("");

    try {
      // Call backend API to analyze file with Gemini Vision (for students)
      const result = await quizService.analyzeFileForStudents(
        file,
        "medium",
        5
      );

      // Transform quiz questions to local format
      const transformedQuestions: QuizQuestion[] = result.questions.map(
        (q, idx) => {
          const correctIndex = q.options?.indexOf(q.correct_answer);

          // Debug log if correct answer not found in options
          if (correctIndex === -1) {
            console.warn(
              `Question ${idx + 1}: correct_answer "${
                q.correct_answer
              }" not found in options:`,
              q.options
            );
          }

          return {
            question: q.question_text,
            options: q.options || [],
            correct:
              correctIndex !== undefined && correctIndex !== -1
                ? correctIndex
                : 0,
          };
        }
      );

      // Create mock summary and flashcards from quiz content
      const summary: Summary = {
        title: `Phân tích từ ${result.fileName}`,
        points: transformedQuestions.slice(0, 3).map((q) => q.question),
        keyInsights: [
          `Tạo ${result.questions.length} câu hỏi từ file`,
          `File: ${result.fileName}`,
        ],
      };

      const flashcards: Flashcard[] = transformedQuestions
        .slice(0, 4)
        .map((q) => ({
          front: q.question,
          back: q.options[q.correct],
        }));

      setSummary(summary);
      setFlashcards(flashcards);
      setQuizQuestions(transformedQuestions);
    } catch (err: any) {
      console.error("Process file error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể xử lý file. Vui lòng kiểm tra API key Gemini hoặc thử lại."
      );
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFlashcardNext = () => {
    if (flashcards.length > 0) {
      setCurrentFlashcard((prev) => (prev + 1) % flashcards.length);
      setShowFlashcardBack(false);
    }
  };

  const handleFlashcardPrev = () => {
    if (flashcards.length > 0) {
      setCurrentFlashcard(
        (prev) => (prev - 1 + flashcards.length) % flashcards.length
      );
      setShowFlashcardBack(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuiz] = answerIndex;
    setQuizAnswers(newAnswers);

    if (currentQuiz < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuiz(currentQuiz + 1), 500);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim()) {
      setQuizError("Vui lòng nhập chủ đề");
      return;
    }

    setGeneratingQuiz(true);
    setQuizError("");

    try {
      const response = await quizService.generateQuiz({
        title: `Quiz về ${quizTopic}`,
        topic: quizTopic,
        difficulty: quizDifficulty,
        num_questions: numQuestions,
        description: `Quiz tự động được tạo bởi AI về chủ đề: ${quizTopic}`,
      });

      // Transform API response to local format
      const transformedQuestions: QuizQuestion[] = response.questions.map(
        (q) => ({
          question: q.question_text,
          options: q.options || [],
          correct: q.options?.indexOf(q.correct_answer) || 0,
        })
      );

      setQuizQuestions(transformedQuestions);
      setCurrentQuiz(0);
      setQuizAnswers([]);

      // Auto-scroll to quiz section
      setTimeout(() => {
        const quizSection = document.getElementById("quiz-section");
        if (quizSection) {
          quizSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err: any) {
      console.error("Generate quiz error:", err);
      setQuizError(
        err.response?.data?.message ||
          "Không thể tạo quiz. Vui lòng kiểm tra API key Gemini trong backend hoặc thử lại."
      );
    } finally {
      setGeneratingQuiz(false);
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
          <p className="text-gray-600">
            Upload tài liệu, nhận tóm tắt, flashcard và quiz tự động
          </p>
        </motion.div>

        {/* Upload Section */}
        {!summary ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {loading ? (
                  <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                ) : (
                  <Upload className="w-10 h-10 text-purple-600" />
                )}
              </div>
              <h3 className="mb-2 text-gray-900">
                {loading ? "Đang xử lý..." : "Upload tài liệu học tập"}
              </h3>
              <p className="text-gray-600 mb-6">
                {loading
                  ? "AI đang phân tích và tạo nội dung học tập..."
                  : "Hỗ trợ PDF, PNG, JPG. AI sẽ tự động phân tích và tạo nội dung học tập"}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 max-w-md mx-auto">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {!loading && (
                <>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      <Upload className="mr-2 w-4 h-4" />
                      Chọn file hoặc kéo thả vào đây
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-4">Tối đa 10MB</p>
                </>
              )}

              {file && !loading && (
                <div className="mt-4 text-sm text-gray-600">
                  File đã chọn: <span className="font-medium">{file.name}</span>
                </div>
              )}
            </Card>

            {/* Feature Preview */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <Card className="p-6 text-center">
                <FileText className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  Tóm tắt thông minh
                </h4>
                <p className="text-sm text-gray-600">
                  AI tóm tắt nội dung chính và key insights
                </p>
              </Card>
              <Card className="p-6 text-center">
                <BookOpen className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  Flashcards tự động
                </h4>
                <p className="text-sm text-gray-600">
                  Tạo thẻ ghi nhớ từ nội dung tài liệu
                </p>
              </Card>
              <Card className="p-6 text-center">
                <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  Quiz kiểm tra
                </h4>
                <p className="text-sm text-gray-600">
                  Câu hỏi trắc nghiệm để ôn tập
                </p>
              </Card>
            </div>

            {/* AI Quiz Generator Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-gray-900">Tạo Quiz với AI</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Nhập chủ đề bạn muốn học, AI sẽ tạo câu hỏi kiểm tra phù hợp
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label
                      htmlFor="quiz-topic"
                      className="text-sm font-medium text-gray-700 mb-1.5 block"
                    >
                      Chủ đề
                    </Label>
                    <Input
                      id="quiz-topic"
                      placeholder="Ví dụ: Lịch sử Việt Nam, Toán học, Hóa học..."
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                      className="w-full"
                      disabled={generatingQuiz}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="quiz-difficulty"
                      className="text-sm font-medium text-gray-700 mb-1.5 block"
                    >
                      Độ khó
                    </Label>
                    <select
                      id="quiz-difficulty"
                      value={quizDifficulty}
                      onChange={(e) => setQuizDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={generatingQuiz}
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                      <option value="mixed">Hỗn hợp</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <Label
                    htmlFor="num-questions"
                    className="text-sm font-medium text-gray-700 mb-1.5 block"
                  >
                    Số câu hỏi: {numQuestions}
                  </Label>
                  <input
                    id="num-questions"
                    type="range"
                    min="3"
                    max="15"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="w-full"
                    disabled={generatingQuiz}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>3 câu</span>
                    <span>15 câu</span>
                  </div>
                </div>

                {quizError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{quizError}</p>
                  </div>
                )}

                <Button
                  onClick={handleGenerateQuiz}
                  disabled={generatingQuiz || !quizTopic.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {generatingQuiz ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Đang tạo quiz với AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-4 h-4" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Summary Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h3 className="text-gray-900">Tóm tắt nội dung</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSummary(null);
                      setFlashcards([]);
                      setQuizQuestions([]);
                      setFile(null);
                      setCurrentFlashcard(0);
                      setCurrentQuiz(0);
                      setQuizAnswers([]);
                    }}
                  >
                    Upload file mới
                  </Button>
                </div>

                <div className="mb-4 p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {summary.title}
                  </h4>
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
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{point}</span>
                    </motion.li>
                  ))}
                </ul>

                {summary.keyInsights.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">
                        Key Insights
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {summary.keyInsights.map((insight, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <Brain className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Flashcards */}
            {flashcards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-pink-600" />
                    <h3 className="text-gray-900">Flashcards</h3>
                    <span className="ml-auto text-sm text-gray-500">
                      {currentFlashcard + 1} / {flashcards.length}
                    </span>
                  </div>

                  <div
                    className="h-64 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 text-white flex flex-col justify-center cursor-pointer"
                    onClick={() => setShowFlashcardBack(!showFlashcardBack)}
                  >
                    <div className="text-center">
                      <div className="text-sm opacity-75 mb-2">
                        {showFlashcardBack ? "Trả lời" : "Câu hỏi"}
                      </div>
                      <div className="text-xl">
                        {showFlashcardBack
                          ? flashcards[currentFlashcard].back
                          : flashcards[currentFlashcard].front}
                      </div>
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
                            index === currentFlashcard
                              ? "bg-purple-600"
                              : "bg-gray-300"
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
                </Card>
              </motion.div>
            )}
          </div>
        )}

        {/* Quiz Section - Independent from summary */}
        {quizQuestions.length > 0 && (
          <motion.div
            id="quiz-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h3 className="text-gray-900">Quiz tự động</h3>
                <span className="ml-auto text-sm text-gray-500">
                  Câu {currentQuiz + 1} / {quizQuestions.length}
                </span>
              </div>

              <div className="mb-6">
                <div className="text-gray-900 mb-4 text-lg font-medium">
                  {quizQuestions[currentQuiz].question}
                </div>
                <div className="space-y-3">
                  {quizQuestions[currentQuiz].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={quizAnswers[currentQuiz] !== undefined}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        quizAnswers[currentQuiz] === index
                          ? index === quizQuestions[currentQuiz].correct
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{option}</span>
                        {quizAnswers[currentQuiz] === index &&
                          (index === quizQuestions[currentQuiz].correct ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <X className="w-5 h-5 text-red-600" />
                          ))}
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
                          ? "bg-green-500"
                          : "bg-red-500"
                        : index === currentQuiz
                        ? "bg-blue-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {currentQuiz === quizQuestions.length - 1 &&
                quizAnswers[currentQuiz] !== undefined && (
                  <div className="mt-6 p-4 bg-green-50 rounded-xl text-center">
                    <div className="text-lg font-semibold text-green-700 mb-2">
                      Điểm số:{" "}
                      {
                        quizAnswers.filter(
                          (ans, i) => ans === quizQuestions[i].correct
                        ).length
                      }
                      /{quizQuestions.length}
                    </div>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setCurrentQuiz(0);
                        setQuizAnswers([]);
                      }}
                    >
                      Làm lại quiz
                    </Button>
                  </div>
                )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
