import { motion } from "motion/react";
import { useState, useEffect } from "react";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { analyticsService } from "../../services/analyticsService";

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const { user } = useAuth();
  const { dashboard, loading, error } = useStudentDashboard();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [optimalTime, setOptimalTime] = useState<any>(null);

  // Fetch analytics data from API - MUST be before early returns
  useEffect(() => {
    const fetchAnalytics = async () => {
      const studentId = (user as any)?.student_id || (dashboard as any)?.student_id;
      if (studentId) {
        try {
          const healthData = await analyticsService.getStudyHealth(studentId);
          setAnalyticsData(healthData);
          
          const timeData = await analyticsService.getOptimalTime(studentId);
          setOptimalTime(timeData);
        } catch (error) {
          console.error('Error fetching analytics:', error);
          // Set default data on error
          setAnalyticsData({
            currentScore: 85,
            attendance: 92,
            assignments: 80,
            performance: 85,
            chartData: [
              { day: 'Ngày 1', score: 30, studyHours: 1.5, assignmentCompletion: 20, label: 'Mới bắt đầu' },
              { day: 'Ngày 2', score: 42, studyHours: 2.0, assignmentCompletion: 35, label: 'Đang làm quen' },
              { day: 'Ngày 3', score: 55, studyHours: 2.5, assignmentCompletion: 50, label: 'Tiến bộ' },
              { day: 'Ngày 4', score: 65, studyHours: 3.0, assignmentCompletion: 60, label: 'Khá tốt' },
              { day: 'Ngày 5', score: 72, studyHours: 3.5, assignmentCompletion: 70, label: 'Tốt' },
              { day: 'Ngày 6', score: 78, studyHours: 4.0, assignmentCompletion: 75, label: 'Rất tốt' },
              { day: 'Ngày 7', score: 85, studyHours: 4.5, assignmentCompletion: 80, label: 'Xuất sắc!' },
            ],
            improvement: 183,
            insight: 'Bạn đã tăng 3h học/tuần, hoàn thành 80% bài tập'
          });
          setOptimalTime({
            bestHours: '20:00-22:00',
            bestDays: ['Tuesday', 'Thursday'],
            tags: ['Giờ vàng', 'Tránh giờ buồn ngủ'],
            insight: 'Bạn học hiệu quả nhất 20h-22h, thứ 3 & thứ 5'
          });
        }
      }
    };

    if (dashboard) {
      fetchAnalytics();
    }
  }, [user, dashboard]);

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

  // Default mock data
  const defaultChartData = [
    { day: 'Ngày 1', score: 30, studyHours: 1.5, assignmentCompletion: 20, label: 'Mới bắt đầu' },
    { day: 'Ngày 2', score: 42, studyHours: 2.0, assignmentCompletion: 35, label: 'Đang làm quen' },
    { day: 'Ngày 3', score: 55, studyHours: 2.5, assignmentCompletion: 50, label: 'Tiến bộ' },
    { day: 'Ngày 4', score: 65, studyHours: 3.0, assignmentCompletion: 60, label: 'Khá tốt' },
    { day: 'Ngày 5', score: 72, studyHours: 3.5, assignmentCompletion: 70, label: 'Tốt' },
    { day: 'Ngày 6', score: 78, studyHours: 4.0, assignmentCompletion: 75, label: 'Rất tốt' },
    { day: 'Ngày 7', score: 85, studyHours: 4.5, assignmentCompletion: 80, label: 'Xuất sắc!' },
  ];

  const studyHealth = {
    score: analyticsData?.currentScore || (dashboard as any).study_health_score || 85,
    attendance: analyticsData?.attendance || (dashboard as any).attendance_rate || 92,
    assignments: analyticsData?.assignments || (dashboard as any).assignment_completion_rate || 80,
    performance: analyticsData?.performance || Math.round(((dashboard as any).current_gpa || 3.5) * 10) || 85,
  };

  const improvementPercent = analyticsData?.improvement || 183;
  const studyInsight = analyticsData?.insight || 'Bạn đã tăng 3h học/tuần, hoàn thành 80% bài tập';
  const chartData = analyticsData?.chartData || defaultChartData;

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

            {/* Study Health Score Card - UPGRADED */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900">Study Health Score</h3>
                      <p className="text-gray-500">7 ngày qua</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    ↑ {improvementPercent}%
                  </div>
                </div>

                {/* Overall Score with Badge */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Điểm hiện tại</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        {studyHealth.score}/100
                      </span>
                      <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded text-xs font-bold">
                        ⭐ Xuất sắc!
                      </span>
                    </div>
                  </div>
                  <Progress value={studyHealth.score} className="h-3 mb-3" />
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-white rounded">💡 {studyInsight}</span>
                  </div>
                </div>

                {/* 7 Days Line Chart */}
                {chartData.length > 0 && (
                  <div className="mb-6 p-4 bg-white rounded-xl border">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Tiến độ 7 ngày</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {chartData[0]?.label} → {chartData[chartData.length - 1]?.label} trong 7 ngày 🎉
                    </p>
                  </div>
                )}

                {/* Optimal Study Time Insight */}
                {optimalTime && (
                  <div className="p-4 bg-blue-50 rounded-xl mb-4">
                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">Giờ học tối ưu của bạn</p>
                        <p className="text-sm text-blue-700">{optimalTime.insight}</p>
                        <div className="flex gap-2 mt-2">
                          {optimalTime.tags?.map((tag: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                              {tag === 'Giờ vàng' ? '⭐' : '😴'} {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Metrics */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Tỷ lệ tham gia lớp</span>
                      <span className="text-sm font-medium text-blue-600">
                        {studyHealth.attendance}%
                      </span>
                    </div>
                    <Progress value={studyHealth.attendance} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Hoàn thành bài tập</span>
                      <span className="text-sm font-medium text-blue-600">
                        {studyHealth.assignments}%
                      </span>
                    </div>
                    <Progress value={studyHealth.assignments} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Điểm trung bình</span>
                      <span className="text-sm font-medium text-blue-600">
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
                {(dashboard as any).upcoming_classes &&
                (dashboard as any).upcoming_classes.length > 0 ? (
                  (dashboard as any).upcoming_classes
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
