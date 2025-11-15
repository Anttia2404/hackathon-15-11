import { motion } from "motion/react";
import { Brain, Sparkles, Plus, Copy, Download, RefreshCw } from "lucide-react";
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

export function QuizGenerator() {
  const [generated, setGenerated] = useState(false);

  const generatedQuestions = [
    {
      question: "Machine Learning là gì?",
      type: "multiple",
      options: [
        "Phương pháp lập trình truyền thống",
        "Nhánh của AI cho phép máy tính học từ dữ liệu",
        "Ngôn ngữ lập trình mới",
        "Hệ điều hành cho AI",
      ],
      correctAnswer: 1,
      explanation:
        "Machine Learning là nhánh của AI tập trung vào việc xây dựng các thuật toán có khả năng học từ dữ liệu và cải thiện hiệu suất theo thời gian.",
    },
    {
      question: "Supervised Learning yêu cầu điều kiện gì?",
      type: "multiple",
      options: [
        "Dữ liệu không có nhãn",
        "Dữ liệu có nhãn (labeled data)",
        "Không cần dữ liệu",
        "Chỉ cần thuật toán",
      ],
      correctAnswer: 1,
      explanation:
        "Supervised Learning cần dữ liệu được gán nhãn để model có thể học mối quan hệ giữa input và output.",
    },
    {
      question: "Neural Network được lấy cảm hứng từ đâu?",
      type: "multiple",
      options: [
        "Mạng Internet",
        "Não người",
        "Hệ thống máy tính",
        "Mạng xã hội",
      ],
      correctAnswer: 1,
      explanation:
        "Neural Network mô phỏng cấu trúc và cách hoạt động của các tế bào thần kinh trong não người.",
    },
    {
      question: "Overfitting là hiện tượng gì?",
      type: "multiple",
      options: [
        "Model học quá tốt trên training data nhưng kém trên test data",
        "Model không học được gì",
        "Model học quá nhanh",
        "Model có quá ít parameters",
      ],
      correctAnswer: 0,
      explanation:
        "Overfitting xảy ra khi model học quá chi tiết từ training data, bao gồm cả nhiễu, dẫn đến hiệu suất kém trên dữ liệu mới.",
    },
    {
      question: "Regularization giúp giải quyết vấn đề gì?",
      type: "multiple",
      options: [
        "Tăng tốc độ training",
        "Giảm overfitting",
        "Tăng độ chính xác training",
        "Giảm số lượng features",
      ],
      correctAnswer: 1,
      explanation:
        "Regularization là kỹ thuật thêm penalty vào loss function để tránh model học quá phức tạp, giúp giảm overfitting.",
    },
  ];

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
                  <Label htmlFor="topic">Chủ đề</Label>
                  <Input
                    id="topic"
                    placeholder="VD: Machine Learning cơ bản"
                    defaultValue="Machine Learning"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Mô tả chi tiết (tuỳ chọn)</Label>
                  <Textarea
                    id="description"
                    placeholder="Nhập mô tả về nội dung cần kiểm tra..."
                    rows={4}
                    defaultValue="Kiểm tra kiến thức cơ bản về ML, bao gồm supervised learning, neural network, overfitting"
                  />
                </div>

                <div>
                  <Label htmlFor="num-questions">Số câu hỏi</Label>
                  <Select defaultValue="5">
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
                  <Select defaultValue="medium">
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
                  <Select defaultValue="multiple">
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

                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                  onClick={() => setGenerated(true)}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate với AI
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
            {!generated ? (
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
                    <span className="text-gray-700">AI-Powered</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <RefreshCw className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <span className="text-gray-700">Tự động</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Copy className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                    <span className="text-gray-700">Dễ sử dụng</span>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="text-gray-600">
                    Đã tạo {generatedQuestions.length} câu hỏi
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Tạo lại
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
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
                  <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo thêm 5 câu
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
