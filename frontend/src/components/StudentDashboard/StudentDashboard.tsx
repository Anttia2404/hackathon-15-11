import { motion } from "motion/react";
import {
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { useStudentDashboard } from "../../hooks/useStudent";
import { useAuth } from "../../contexts/AuthContext";

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const { user } = useAuth();
  const { dashboard, loading, error } = useStudentDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Không thể tải dữ liệu"}
          </p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  const studyHealth = {
    score: dashboard.study_health_score || 0,
    attendance: dashboard.attendance_rate || 0,
    assignments: dashboard.assignment_completion_rate || 0,
    performance: Math.round(dashboard.current_gpa * 10) || 0,
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
          <h1 className="mb-2 text-gray-900">
            Chào mừng trở lại, {user?.full_name || "Sinh viên"}! 👋
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
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
              <Card
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate("smart-scheduler")}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900">Smart Schedule</h3>
                      <p className="text-gray-500">
                        Lịch học thông minh với AI
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">
                  Tạo lịch học tối ưu dựa trên thời gian rảnh, mục tiêu GPA và
                  thói quen học tập của bạn
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
              <Card
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate("ai-summary")}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900">AI Summary</h3>
                      <p className="text-gray-500">
                        Tóm tắt tài liệu thông minh
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">
                  Upload PDF/slide, nhận tóm tắt tự động, flashcard và quiz để
                  ôn tập hiệu quả
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
                    <span className="text-green-600">
                      {studyHealth.score}/100
                    </span>
                  </div>
                  <Progress value={studyHealth.score} className="h-3" />
                  <p className="text-gray-600 mt-2">
                    Tốt! Bạn đang duy trì nhịp độ học tập ổn định
                  </p>
                </div>

                {/* Detailed Metrics */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Tỷ lệ tham gia lớp</span>
                      <span className="text-blue-600">
                        {studyHealth.attendance}%
                      </span>
                    </div>
                    <Progress value={studyHealth.attendance} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Hoàn thành bài tập</span>
                      <span className="text-blue-600">
                        {studyHealth.assignments}%
                      </span>
                    </div>
                    <Progress value={studyHealth.assignments} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Điểm trung bình</span>
                      <span className="text-blue-600">
                        {studyHealth.performance}%
                      </span>
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
                {dashboard.upcoming_classes &&
                dashboard.upcoming_classes.length > 0 ? (
                  dashboard.upcoming_classes
                    .slice(0, 4)
                    .map((classItem: any, index: number) => {
                      const startTime = new Date(classItem.start_time);
                      const endTime = new Date(classItem.end_time);
                      const now = new Date();
                      const isCurrent = now >= startTime && now <= endTime;
                      const isCompleted = now > endTime;

                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isCurrent
                              ? "border-blue-500 bg-blue-50"
                              : isCompleted
                              ? "border-gray-200 bg-gray-50 opacity-60"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-gray-900">
                              {classItem.course_name}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs">
                                Đang diễn ra
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {startTime.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {endTime.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            Phòng {classItem.room || "TBA"}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Không có lớp học hôm nay
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => onNavigate("smart-scheduler")}
              >
                Xem lịch đầy đủ
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
