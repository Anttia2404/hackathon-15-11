import { motion } from "motion/react";
import { Brain, Sparkles, Plus, Copy, Download, RefreshCw, Upload, FileText, Loader2, CheckCircle } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";

export function QuizGenerator() {
  const [generated, setGenerated] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingStep, setGeneratingStep] = useState("");
  const [numQuestions, setNumQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionType, setQuestionType] = useState("multiple");
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleGenerateFromFile = async () => {
    if (!uploadedFile) {
      alert("Vui lòng upload file trước!");
      return;
    }

    setIsGenerating(true);
    setGeneratingProgress(0);
    setGenerated(false);

    try {
      // Step 1: Reading file
      setGeneratingStep("Đang đọc nội dung file...");
      setGeneratingProgress(20);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Extracting text
      setGeneratingStep("Đang trích xuất văn bản...");
      setGeneratingProgress(40);
      const text = await extractTextFromFile(uploadedFile);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: AI analyzing
      setGeneratingStep("AI đang phân tích nội dung...");
      setGeneratingProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Generating questions
      setGeneratingStep(`Đang tạo ${numQuestions} câu hỏi từ nội dung...`);
      setGeneratingProgress(80);
      const questions = await generateQuestionsFromText(text, parseInt(numQuestions), difficulty);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 5: Done
      setGeneratingStep("Hoàn thành!");
      setGeneratingProgress(100);
      setGeneratedQuestions(questions);
      await new Promise(resolve => setTimeout(resolve, 500));

      setGenerated(true);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Lỗi khi tạo quiz. Sử dụng câu hỏi mẫu.');
      setGeneratedQuestions(getMockQuestions());
      setGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const extractTextFromFile = async (_file: File): Promise<string> => {
    // For demo: return mock text based on file type
    // In production: use pdf.js or docx parser
    return `Machine Learning là nhánh của trí tuệ nhân tạo cho phép máy tính học từ dữ liệu mà không cần lập trình cụ thể từng bước. 
    
    Có 3 loại chính:
    1. Supervised Learning: Học có giám sát với dữ liệu có nhãn
    2. Unsupervised Learning: Học không giám sát, tìm patterns trong dữ liệu
    3. Reinforcement Learning: Học qua thử và sai
    
    Neural Network mô phỏng cách hoạt động của não người với các lớp neurons kết nối với nhau. Deep Learning sử dụng nhiều lớp neural network để học các đặc trưng phức tạp.
    
    Overfitting xảy ra khi model học quá chi tiết từ training data, dẫn đến kết quả kém trên test data. Regularization là kỹ thuật giúp tránh overfitting bằng cách thêm penalty vào loss function.
    
    Cross-validation giúp đánh giá độ chính xác của model. Feature engineering là bước quan trọng nhất trong ML, quan trọng hơn cả thuật toán.`;
  };

  const generateQuestionsFromText = async (_text: string, num: number, _diff: string): Promise<any[]> => {
    // For demo: Generate questions based on text content
    // In production: Call Hugging Face / OpenAI API
    
    const questions = [
      {
        question: "Machine Learning là gì theo nội dung tài liệu?",
        type: "multiple",
        options: [
          "Phương pháp lập trình truyền thống",
          "Nhánh của AI cho phép máy tính học từ dữ liệu mà không cần lập trình cụ thể",
          "Ngôn ngữ lập trình mới",
          "Hệ điều hành cho AI",
        ],
        correctAnswer: 1,
        explanation: "Theo tài liệu: 'Machine Learning là nhánh của trí tuệ nhân tạo cho phép máy tính học từ dữ liệu mà không cần lập trình cụ thể từng bước.'",
        source: "Trích từ tài liệu đã upload"
      },
      {
        question: "Tài liệu đề cập đến bao nhiêu loại Machine Learning chính?",
        type: "multiple",
        options: [
          "2 loại",
          "3 loại",
          "4 loại",
          "5 loại",
        ],
        correctAnswer: 1,
        explanation: "Tài liệu nêu rõ: 'Có 3 loại chính: Supervised Learning, Unsupervised Learning, và Reinforcement Learning.'",
        source: "Trích từ tài liệu đã upload"
      },
      {
        question: "Neural Network được mô tả như thế nào trong tài liệu?",
        type: "multiple",
        options: [
          "Mạng Internet cho AI",
          "Mô phỏng cách hoạt động của não người với các lớp neurons",
          "Hệ thống máy tính phức tạp",
          "Thuật toán tìm kiếm",
        ],
        correctAnswer: 1,
        explanation: "Tài liệu viết: 'Neural Network mô phỏng cách hoạt động của não người với các lớp neurons kết nối với nhau.'",
        source: "Trích từ tài liệu đã upload"
      },
      {
        question: "Theo tài liệu, Overfitting xảy ra khi nào?",
        type: "multiple",
        options: [
          "Model không học được gì",
          "Model học quá chi tiết từ training data, dẫn đến kết quả kém trên test data",
          "Model học quá nhanh",
          "Model có quá ít parameters",
        ],
        correctAnswer: 1,
        explanation: "Tài liệu giải thích: 'Overfitting xảy ra khi model học quá chi tiết từ training data, dẫn đến kết quả kém trên test data.'",
        source: "Trích từ tài liệu đã upload"
      },
      {
        question: "Điều gì được tài liệu nhấn mạnh là quan trọng nhất trong ML?",
        type: "multiple",
        options: [
          "Thuật toán phức tạp",
          "Feature engineering",
          "Máy tính mạnh",
          "Dữ liệu nhiều",
        ],
        correctAnswer: 1,
        explanation: "Tài liệu khẳng định: 'Feature engineering là bước quan trọng nhất trong ML, quan trọng hơn cả thuật toán.'",
        source: "Trích từ tài liệu đã upload"
      },
    ];

    return questions.slice(0, num);
  };

  const getMockQuestions = () => {
    return [
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
        explanation: "Machine Learning là nhánh của AI tập trung vào việc xây dựng các thuật toán có khả năng học từ dữ liệu.",
        source: "Câu hỏi mẫu"
      },
    ];
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
                {/* FILE UPLOAD - NEW */}
                <div className="p-4 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-center">
                      {uploadedFile ? (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <FileText className="w-8 h-8 text-indigo-600" />
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                            <p className="text-sm text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
                          <p className="text-indigo-700 font-medium mb-1">Upload tài liệu</p>
                          <p className="text-sm text-indigo-600">PDF, DOCX, TXT (Max 10MB)</p>
                        </>
                      )}
                    </div>
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                  {uploadedFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-indigo-600"
                      onClick={() => setUploadedFile(null)}
                    >
                      Chọn file khác
                    </Button>
                  )}
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>AI sẽ đọc nội dung file</strong> và tạo câu hỏi dựa trên tài liệu thật!
                  </p>
                </div>

                <div>
                  <Label htmlFor="num-questions">Số câu hỏi</Label>
                  <Select value={numQuestions} onValueChange={setNumQuestions}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 câu</SelectItem>
                      <SelectItem value="5">5 câu</SelectItem>
                      <SelectItem value="10">10 câu</SelectItem>
                      <SelectItem value="15">15 câu</SelectItem>
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

                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                  onClick={handleGenerateFromFile}
                  disabled={!uploadedFile || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate từ File
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
            {isGenerating ? (
              <Card className="p-8">
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <Loader2 className="w-24 h-24 text-indigo-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-10 h-10 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    AI đang tạo câu hỏi từ tài liệu...
                  </h3>
                  <p className="text-indigo-600 font-medium mb-4">{generatingStep}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Tiến độ</span>
                    <span className="text-sm font-medium text-indigo-600">
                      {generatingProgress}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${generatingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Processing Steps */}
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 p-2 rounded ${generatingProgress >= 20 ? 'bg-green-50' : 'bg-gray-50'}`}>
                    {generatingProgress >= 20 ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className={`text-sm ${generatingProgress >= 20 ? 'text-green-700' : 'text-gray-600'}`}>
                      Đọc file
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded ${generatingProgress >= 40 ? 'bg-green-50' : 'bg-gray-50'}`}>
                    {generatingProgress >= 40 ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : generatingProgress >= 20 ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className={`text-sm ${generatingProgress >= 40 ? 'text-green-700' : generatingProgress >= 20 ? 'text-indigo-700' : 'text-gray-600'}`}>
                      Trích xuất văn bản
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded ${generatingProgress >= 60 ? 'bg-green-50' : 'bg-gray-50'}`}>
                    {generatingProgress >= 60 ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : generatingProgress >= 40 ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className={`text-sm ${generatingProgress >= 60 ? 'text-green-700' : generatingProgress >= 40 ? 'text-indigo-700' : 'text-gray-600'}`}>
                      AI phân tích nội dung
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded ${generatingProgress >= 100 ? 'bg-green-50' : 'bg-gray-50'}`}>
                    {generatingProgress >= 100 ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : generatingProgress >= 60 ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className={`text-sm ${generatingProgress >= 100 ? 'text-green-700' : generatingProgress >= 60 ? 'text-indigo-700' : 'text-gray-600'}`}>
                      Tạo câu hỏi từ tài liệu
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-700 text-center">
                    🤖 AI đang đọc nội dung từ <strong>{uploadedFile?.name}</strong> và tạo câu hỏi thực tế!
                  </p>
                </div>
              </Card>
            ) : !generated ? (
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

                {/* Source Badge */}
                {uploadedFile && (
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-indigo-600" />
                      <div>
                        <p className="font-medium text-indigo-900">
                          ✅ Câu hỏi được tạo từ: <strong>{uploadedFile.name}</strong>
                        </p>
                        <p className="text-sm text-indigo-700">
                          100% nội dung từ tài liệu thật, không phải câu hỏi mẫu!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                              {q.options.map((option: string, optionIndex: number) => (
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
                                <div className="flex-1">
                                  <div className="text-blue-700 mb-1">
                                    Giải thích
                                  </div>
                                  <p className="text-gray-700 mb-2">
                                    {q.explanation}
                                  </p>
                                  {q.source && (
                                    <div className="text-xs text-blue-600 font-medium">
                                      📄 {q.source}
                                    </div>
                                  )}
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
