import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ThumbsUp, Star, TrendingUp, Users } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import discussionService, { Discussion } from '../../services/discussionService';

interface DiscussionResultsProps {
  discussion: Discussion;
  onClose: () => void;
}

export default function DiscussionResults({ discussion, onClose }: DiscussionResultsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
    const interval = setInterval(loadResults, 5000); // Auto refresh every 5s
    return () => clearInterval(interval);
  }, [discussion.discussion_id]);

  const loadResults = async () => {
    try {
      const result = await discussionService.getDiscussionById(discussion.discussion_id);
      console.log('Discussion results:', result);
      setData(result);
    } catch (error) {
      console.error('Load results error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeature = async (responseId: string) => {
    try {
      await discussionService.featureResponse(responseId);
      loadResults();
    } catch (error) {
      console.error('Feature error:', error);
    }
  };

  if (loading || !data) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl my-8"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{discussion.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{data?.total_responses || 0} phản hồi</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Đang cập nhật real-time</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* No responses message */}
          {(!data.responses || data.responses.length === 0) && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có phản hồi nào</p>
              <p className="text-gray-400 text-sm mt-2">
                Chia sẻ mã PIN với sinh viên để họ tham gia
              </p>
            </div>
          )}

          {/* Poll Results */}
          {discussion.type === 'poll' && data.aggregated_results && data.responses?.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Kết quả khảo sát</h3>
              {Object.entries(data.aggregated_results).map(([option, count]: [string, any]) => {
                const percentage = (count / data.total_responses) * 100;
                return (
                  <div key={option} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{option}</span>
                      <span className="text-gray-600">
                        {count} phiếu ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Word Cloud Results */}
          {discussion.type === 'wordcloud' && data.aggregated_results && data.responses?.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Từ khóa phổ biến</h3>
              <div className="flex flex-wrap gap-3">
                {data.aggregated_results.map((item: any, index: number) => {
                  const size = Math.min(12 + item.count * 2, 48);
                  return (
                    <motion.span
                      key={item.word}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      style={{ fontSize: `${size}px` }}
                      className="font-bold text-blue-600 hover:text-purple-600 transition-colors cursor-default"
                    >
                      {item.word}
                    </motion.span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Q&A and Feedback Responses */}
          {(discussion.type === 'qna' || discussion.type === 'feedback') && data.responses?.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">
                {discussion.type === 'qna' ? 'Câu hỏi' : 'Ý kiến'}
              </h3>
              {data.responses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Chưa có phản hồi nào</p>
              ) : (
                data.responses
                  .sort((a: any, b: any) => b.upvotes - a.upvotes)
                  .map((response: any) => (
                    <Card
                      key={response.response_id}
                      className={`p-4 ${response.is_featured ? 'border-2 border-yellow-400 bg-yellow-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2">
                            {response.response_data.text || response.response_data.question}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              {response.is_anonymous ? 'Ẩn danh' : 'Sinh viên'}
                            </span>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{response.upvotes}</span>
                            </div>
                            {response.is_featured && (
                              <div className="flex items-center gap-1 text-yellow-600">
                                <Star className="w-4 h-4 fill-current" />
                                <span>Nổi bật</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFeature(response.response_id)}
                        >
                          <Star
                            className={`w-4 h-4 ${response.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`}
                          />
                        </Button>
                      </div>
                    </Card>
                  ))
              )}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
