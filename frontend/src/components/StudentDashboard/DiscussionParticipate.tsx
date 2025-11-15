import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import discussionService from '../../services/discussionService';

interface DiscussionParticipateProps {
  discussion: any;
  onBack: () => void;
}

export default function DiscussionParticipate({ discussion, onBack }: DiscussionParticipateProps) {
  const [response, setResponse] = useState<any>({});
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await discussionService.submitResponse({
        discussion_id: discussion.discussion_id,
        response_data: response,
        is_anonymous: isAnonymous,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Đã gửi thành công!
          </h2>
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã tham gia thảo luận
          </p>
          <Button onClick={onBack} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Tham gia thảo luận khác
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button onClick={onBack} variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {discussion.title}
              </h2>
              {discussion.description && (
                <p className="text-gray-600">{discussion.description}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Poll */}
              {discussion.type === 'poll' && discussion.settings.options && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Chọn câu trả lời của bạn:
                  </label>
                  {discussion.settings.options.map((option: string, index: number) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        response.answer === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="poll-option"
                        value={option}
                        checked={response.answer === option}
                        onChange={(e) => setResponse({ answer: e.target.value })}
                        className="w-5 h-5 text-blue-600"
                        required
                      />
                      <span className="ml-3 text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Q&A */}
              {discussion.type === 'qna' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Câu hỏi của bạn:
                  </label>
                  <textarea
                    value={response.question || ''}
                    onChange={(e) => setResponse({ question: e.target.value })}
                    placeholder="Nhập câu hỏi của bạn..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Word Cloud */}
              {discussion.type === 'wordcloud' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhập từ khóa hoặc ý kiến ngắn:
                  </label>
                  <input
                    type="text"
                    value={response.text || ''}
                    onChange={(e) => setResponse({ text: e.target.value })}
                    placeholder="VD: Thú vị, Hữu ích, Cần cải thiện..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Feedback */}
              {discussion.type === 'feedback' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ý kiến của bạn:
                  </label>
                  <textarea
                    value={response.text || ''}
                    onChange={(e) => setResponse({ text: e.target.value })}
                    placeholder="Chia sẻ ý kiến của bạn..."
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Anonymous option */}
              {discussion.settings.allow_anonymous && (
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-700">
                    Gửi ẩn danh (giảng viên sẽ không biết bạn là ai)
                  </label>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-lg gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {loading ? (
                  'Đang gửi...'
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Gửi câu trả lời
                  </>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
