import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import discussionService from '../../services/discussionService';
import DiscussionParticipate from './DiscussionParticipate';

export function JoinDiscussion() {
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discussion, setDiscussion] = useState<any>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pinCode.length !== 6) {
      setError('Mã PIN phải có 6 chữ số');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await discussionService.joinDiscussion(pinCode);
      setDiscussion(result.discussion);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy thảo luận. Vui lòng kiểm tra lại mã PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setDiscussion(null);
    setPinCode('');
    setError('');
  };

  if (discussion) {
    return <DiscussionParticipate discussion={discussion} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Tham gia thảo luận
          </h1>
          <p className="text-gray-600">
            Nhập mã PIN 6 số do giảng viên cung cấp
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <form onSubmit={handleJoin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Mã PIN
                </label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPinCode(value);
                    setError('');
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-6 py-4 text-center text-3xl font-bold tracking-widest border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <p className="text-xs text-gray-500 text-center mt-2">
                  Nhập 6 chữ số
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={pinCode.length !== 6 || loading}
                className="w-full py-6 text-lg gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tham gia...
                  </>
                ) : (
                  <>
                    Tham gia
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">💡 Hướng dẫn:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Nhận mã PIN 6 số từ giảng viên</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Nhập mã PIN vào ô bên trên</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Trả lời câu hỏi hoặc tham gia thảo luận</span>
                </li>
              </ul>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default JoinDiscussion;
