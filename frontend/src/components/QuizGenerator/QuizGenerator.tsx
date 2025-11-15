import { motion } from "motion/react";
import {
  Brain,
  Sparkles,
  Plus,
  Copy,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import quizService, {
  QuizQuestion as ApiQuizQuestion,
} from "../../services/quizService";

interface QuizQuestion {
  question: string;
  type: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [numQuestions, setNumQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionType, setQuestionType] = useState("multiple");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>(
    []
  );

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Vui lòng nhập chủ đề");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await quizService.generateQuiz({
        title: topic.trim(),
        description: description.trim(),
        topic: topic.trim(),
        difficulty: difficulty as "easy" | "medium" | "hard" | "mixed",
        num_questions: parseInt(numQuestions),
      });

      // Transform API response to local format
      const questions: QuizQuestion[] = (response.questions || []).map((q) => ({
        question: q.question_text,
        type: q.question_type,
        options: q.options || [],
        correctAnswer: 0, // API should provide this
        explanation: q.explanation || "",
      }));

      setGeneratedQuestions(questions);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể tạo quiz. Vui lòng thử lại."
      );
      setGeneratedQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = generatedQuestions
      .map((q, i) => {
        const options = q.options
          .map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`)
          .join("\n");
        return `Câu ${i + 1}: ${
          q.question
        }\n${options}\nĐáp án: ${String.fromCharCode(
          65 + q.correctAnswer
        )}\nGiải thích: ${q.explanation}\n`;
      })
      .join("\n---\n\n");

    navigator.clipboard.writeText(text);
    alert("Đã copy vào clipboard!");
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(generatedQuestions, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `quiz_${topic.replace(/\s+/g, "_")}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-indigo-600" />
            <h1 className="text-gray-900">AI Quiz Generator</h1>
          </div>
          <p className="text-gray-600">
            Tạo bài kiểm tra tự động bằng AI, tiết kiệm thời gian cho giảng viên
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 sticky top-24">
              <h3 className="mb-6 text-gray-900">Cấu hình bài kiểm tra</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic">Chủ đề *</Label>
                  <Input
                    id="topic"
                    placeholder="VD: Machine Learning cơ bản"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Mô tả chi tiết (tuỳ chọn)</Label>
                  <Textarea
                    id="description"
                    placeholder="Nhập mô tả về nội dung cần kiểm tra..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="num-questions">Số câu hỏi</Label>
                  <Select value={numQuestions} onValueChange={setNumQuestions}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 câu</SelectItem>
                      <SelectItem value="10">10 câu</SelectItem>
                      <SelectItem value="15">15 câu</SelectItem>
                      <SelectItem value="20">20 câu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Độ khó</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Dễ</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="hard">Khó</SelectItem>
                      <SelectItem value="mixed">Hỗn hợp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Loại câu hỏi</Label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple">Trắc nghiệm</SelectItem>
                      <SelectItem value="truefalse">Đúng/Sai</SelectItem>
                      <SelectItem value="short">Tự luận ngắn</SelectItem>
                      <SelectItem value="mixed">Hỗn hợp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate với AI
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Generated Questions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {generatedQuestions.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-gray-900">
                  Sẵn sàng tạo bài kiểm tra?
                </h3>
                <p className="text-gray-600 mb-6">
                  Điền thông tin bên trái và nhấn "Generate" để AI tạo câu hỏi
                  tự động
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Sparkles className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                    <span className="text-sm text-gray-700">AI-Powered</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <RefreshCw className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <span className="text-sm text-gray-700">Tự động</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Copy className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                    <span className="text-sm text-gray-700">Dễ sử dụng</span>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Đã tạo {generatedQuestions.length} câu hỏi
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setGeneratedQuestions([])}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Tạo mới
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handleCopy}
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                      onClick={handleExport}
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Questions List */}
                {generatedQuestions.map((q, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-gray-900 mb-4">
                              {q.question}
                            </div>

                            {/* Options */}
                            <div className="space-y-2 mb-4">
                              {q.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`p-3 rounded-lg border-2 ${
                                    optionIndex === q.correctAnswer
                                      ? "border-green-500 bg-green-50"
                                      : "border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 flex-shrink-0">
                                      {String.fromCharCode(65 + optionIndex)}
                                    </span>
                                    <span className="text-gray-700">
                                      {option}
                                    </span>
                                    {optionIndex === q.correctAnswer && (
                                      <span className="ml-auto px-2 py-1 bg-green-600 text-white rounded text-xs">
                                        Đáp án đúng
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Explanation */}
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                                <div>
                                  <div className="text-blue-700 mb-1">
                                    Giải thích
                                  </div>
                                  <p className="text-gray-700">
                                    {q.explanation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {/* Generate More */}
                <Card className="p-6 text-center bg-gradient-to-br from-indigo-50 to-purple-50">
                  <h3 className="mb-2 text-gray-900">Cần thêm câu hỏi?</h3>
                  <p className="text-gray-600 mb-4">
                    AI có thể tạo thêm câu hỏi với các góc độ khác nhau
                  </p>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                    onClick={handleGenerate}
                    disabled={loading || !topic.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Tạo thêm {numQuestions} câu
                      </>
                    )}
                  </Button>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
