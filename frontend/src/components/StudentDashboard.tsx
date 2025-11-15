import { motion } from 'motion/react';
import { Calendar, FileText, TrendingUp, Clock, BookOpen, Target, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const todaySchedule = [
    { time: '08:00 - 09:30', subject: 'Trí tuệ nhân tạo', room: 'A301', status: 'completed' },
    { time: '10:00 - 11:30', subject: 'Cơ sở dữ liệu', room: 'B205', status: 'current' },
    { time: '13:00 - 14:30', subject: 'Mạng máy tính', room: 'C102', status: 'upcoming' },
    { time: '15:00 - 16:30', subject: 'Lập trình web', room: 'D401', status: 'upcoming' },
  ];

  const studyHealth = {
    score: 78,
    attendance: 92,
    assignments: 85,
    performance: 76,
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
          <h1 className="mb-2 text-gray-900">Chào mừng trở lại, Minh Anh! 👋</h1>
          <p className="text-gray-600">Hôm nay là thứ Hai, 15 tháng 11, 2025</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Features */}
          <div className="lg:col-span-2 space-y-6">
            {/* Smart Schedule Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('smart-scheduler')}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900">Smart Schedule</h3>
                      <p className="text-gray-500">Lịch học thông minh với AI</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">
                  Tạo lịch học tối ưu dựa trên thời gian rảnh, mục tiêu GPA và thói quen học tập của bạn
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Tạo lịch học mới
                </Button>
              </Card>
            </motion.div>

            {/* AI Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('ai-summary')}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900">AI Summary</h3>
                      <p className="text-gray-500">Tóm tắt tài liệu thông minh</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">
                  Upload PDF/slide, nhận tóm tắt tự động, flashcard và quiz để ôn tập hiệu quả
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <span className="text-purple-700">Summary</span>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-pink-600 mx-auto mb-1" />
                    <span className="text-pink-700">Flashcard</span>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <Target className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                    <span className="text-indigo-700">Quiz</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Study Health Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-gray-900">Study Health Score</h3>
                    <p className="text-gray-500">Đánh giá sức khỏe học tập</p>
                  </div>
                </div>

                {/* Overall Score */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Điểm tổng thể</span>
                    <span className="text-green-600">{studyHealth.score}/100</span>
                  </div>
                  <Progress value={studyHealth.score} className="h-3" />
                  <p className="text-gray-600 mt-2">Tốt! Bạn đang duy trì nhịp độ học tập ổn định</p>
                </div>

                {/* Detailed Metrics */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Tỷ lệ tham gia lớp</span>
                      <span className="text-blue-600">{studyHealth.attendance}%</span>
                    </div>
                    <Progress value={studyHealth.attendance} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Hoàn thành bài tập</span>
                      <span className="text-blue-600">{studyHealth.assignments}%</span>
                    </div>
                    <Progress value={studyHealth.assignments} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Điểm trung bình</span>
                      <span className="text-blue-600">{studyHealth.performance}%</span>
                    </div>
                    <Progress value={studyHealth.performance} className="h-2" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-gray-900">Lịch học hôm nay</h3>
              </div>

              <div className="space-y-4">
                {todaySchedule.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      item.status === 'current'
                        ? 'border-blue-500 bg-blue-50'
                        : item.status === 'completed'
                        ? 'border-gray-200 bg-gray-50 opacity-60'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-gray-900">{item.subject}</span>
                      {item.status === 'current' && (
                        <span className="px-2 py-1 bg-blue-600 text-white rounded-full">
                          Đang diễn ra
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600">{item.time}</div>
                    <div className="text-gray-500">Phòng {item.room}</div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4" onClick={() => onNavigate('smart-scheduler')}>
                Xem lịch đầy đủ
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
