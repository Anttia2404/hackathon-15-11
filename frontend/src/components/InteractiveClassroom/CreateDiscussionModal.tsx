import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  BarChart3,
  HelpCircle,
  Cloud,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

interface CreateDiscussionModalProps {
  onClose: () => void;
  onCreate: (data: any) => void;
}

export default function CreateDiscussionModal({
  onClose,
  onCreate,
}: CreateDiscussionModalProps) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Handle ESC key to close modal
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);
  const [formData, setFormData] = useState<{
    type: string;
    title: string;
    description: string;
    expires_in_minutes: number;
    settings: {
      options?: string[];
      allow_anonymous?: boolean;
      allow_multiple_responses?: boolean;
    };
  }>({
    type: "",
    title: "",
    description: "",
    expires_in_minutes: 60,
    settings: {},
  });

  const discussionTypes = [
    {
      id: "poll",
      label: "Khảo sát nhanh",
      icon: BarChart3,
      description: "Tạo câu hỏi trắc nghiệm với nhiều lựa chọn",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "qna",
      label: "Hỏi đáp",
      icon: HelpCircle,
      description: "Sinh viên đặt câu hỏi, upvote câu hay",
      color: "from-green-500 to-green-600",
    },
    {
      id: "wordcloud",
      label: "Word Cloud",
      icon: Cloud,
      description: "Thu thập từ khóa, tạo đám mây từ",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "feedback",
      label: "Ý kiến ẩn danh",
      icon: MessageCircle,
      description: "Nhận phản hồi trung thực từ sinh viên",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, type });
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-[101]"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-6 relative bg-white shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Tạo thảo luận mới</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {step === 1 && (
            <div>
              <p className="text-gray-600 mb-6">
                Chọn loại thảo luận bạn muốn tạo:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {discussionTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTypeSelect(type.id)}
                      className="text-left p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center mb-4`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">
                        {type.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="VD: Bạn nghĩ gì về bài học hôm nay?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả (tùy chọn)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Thêm hướng dẫn hoặc ngữ cảnh..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {formData.type === "poll" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Các lựa chọn (mỗi dòng một lựa chọn)
                    </label>
                    <textarea
                      required
                      placeholder="Lựa chọn A&#10;Lựa chọn B&#10;Lựa chọn C&#10;Lựa chọn D"
                      rows={4}
                      onChange={(e) => {
                        const options = e.target.value
                          .split("\n")
                          .filter((o) => o.trim());
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, options },
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian hiệu lực (phút)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={formData.expires_in_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expires_in_minutes: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Thảo luận sẽ tự động đóng sau thời gian này
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.settings.allow_anonymous || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          allow_anonymous: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-700">
                    Cho phép phản hồi ẩn danh
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Quay lại
                </Button>
                <Button type="submit" className="flex-1 gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Tạo thảo luận
                </Button>
              </div>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
