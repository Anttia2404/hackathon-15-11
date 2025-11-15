import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  ArrowRight,
  Loader2,
  Bell,
  CheckCircle,
  Users,
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

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dashboard, loading, error } = useStudentDashboard();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [optimalTime, setOptimalTime] = useState<any>(null);
  const [helpRequested, setHelpRequested] = useState(false);
  const [sendingHelp, setSendingHelp] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch analytics data from API - MUST be before early returns
  useEffect(() => {
    const fetchAnalytics = async () => {
      const studentId =
        (user as any)?.student_id || (dashboard as any)?.student_id;
      if (studentId) {
        try {
          const healthData = await analyticsService.getStudyHealth(studentId);
          setAnalyticsData(healthData);

          const timeData = await analyticsService.getOptimalTime(studentId);
          setOptimalTime(timeData);
        } catch (error) {
          console.error("Error fetching analytics:", error);
          // Set default data on error
          setAnalyticsData({
            currentScore: 85,
            attendance: 92,
            assignments: 80,
            performance: 85,
            chartData: [
              {
                day: "Ngày 1",
                score: 30,
                studyHours: 1.5,
                assignmentCompletion: 20,
                label: "Mới bắt đầu",
              },
              {
                day: "Ngày 2",
                score: 42,
                studyHours: 2.0,
                assignmentCompletion: 35,
                label: "Đang làm quen",
              },
              {
                day: "Ngày 3",
                score: 55,
                studyHours: 2.5,
                assignmentCompletion: 50,
                label: "Tiến bộ",
              },
              {
                day: "Ngày 4",
                score: 65,
                studyHours: 3.0,
                assignmentCompletion: 60,
                label: "Khá tốt",
              },
              {
                day: "Ngày 5",
                score: 72,
                studyHours: 3.5,
                assignmentCompletion: 70,
                label: "Tốt",
              },
              {
                day: "Ngày 6",
                score: 78,
                studyHours: 4.0,
                assignmentCompletion: 75,
                label: "Rất tốt",
              },
              {
                day: "Ngày 7",
                score: 85,
                studyHours: 4.5,
                assignmentCompletion: 80,
                label: "Xuất sắc!",
              },
            ],
            improvement: 183,
            insight: "Bạn đã tăng 3h học/tuần, hoàn thành 80% bài tập",
          });
          setOptimalTime({
            bestHours: "20:00-22:00",
            bestDays: ["Tuesday", "Thursday"],
            tags: ["Giờ vàng", "Tránh giờ buồn ngủ"],
            insight: "Bạn học hiệu quả nhất 20h-22h, thứ 3 & thứ 5",
          });
        }
      }
    };

    if (dashboard) {
      fetchAnalytics();
    }
  }, [user, dashboard]);

  // Poll for notifications every 5 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const studentId =
          (user as any)?.student_id || (dashboard as any)?.student_id;
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
          }/notifications/student/${studentId}`
        );
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (dashboard) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
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
    {
      day: "Ngày 1",
      score: 30,
      studyHours: 1.5,
      assignmentCompletion: 20,
      label: "Mới bắt đầu",
    },
    {
      day: "Ngày 2",
      score: 42,
      studyHours: 2.0,
      assignmentCompletion: 35,
      label: "Đang làm quen",
    },
    {
      day: "Ngày 3",
      score: 55,
      studyHours: 2.5,
      assignmentCompletion: 50,
      label: "Tiến bộ",
    },
    {
      day: "Ngày 4",
      score: 65,
      studyHours: 3.0,
      assignmentCompletion: 60,
      label: "Khá tốt",
    },
    {
      day: "Ngày 5",
      score: 72,
      studyHours: 3.5,
      assignmentCompletion: 70,
      label: "Tốt",
    },
    {
      day: "Ngày 6",
      score: 78,
      studyHours: 4.0,
      assignmentCompletion: 75,
      label: "Rất tốt",
    },
    {
      day: "Ngày 7",
      score: 85,
      studyHours: 4.5,
      assignmentCompletion: 80,
      label: "Xuất sắc!",
    },
  ];

  const studyHealth = {
    score:
      analyticsData?.currentScore ||
      (dashboard as any).study_health_score ||
      85,
    attendance:
      analyticsData?.attendance || (dashboard as any).attendance_rate || 92,
    assignments:
      analyticsData?.assignments ||
      (dashboard as any).assignment_completion_rate ||
      80,
    performance:
      analyticsData?.performance ||
      Math.round(((dashboard as any).current_gpa || 3.5) * 10) ||
      85,
  };

  const improvementPercent = analyticsData?.improvement || 183;
  const studyInsight =
    analyticsData?.insight || "Bạn đã tăng 3h học/tuần, hoàn thành 80% bài tập";
  const chartData = analyticsData?.chartData || defaultChartData;

  const handleRequestHelp = async () => {
    setSendingHelp(true);
    try {
      const studentId =
        (user as any)?.student_id || (dashboard as any)?.student_id;
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
        }/notifications/request-help`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            studentName: user?.full_name || "Sinh viên",
            message: "Sinh viên cần hỗ trợ từ giảng viên",
            studyHealth: studyHealth.score,
          }),
        }
      );

      if (response.ok) {
        setHelpRequested(true);
        setTimeout(() => setHelpRequested(false), 5000);
      }
    } catch (error) {
      console.error("Error requesting help:", error);
      alert("Không thể gửi yêu cầu. Vui lòng thử lại!");
    } finally {
      setSendingHelp(false);
    }
  };

  return (
    <div
      className="min-h-screen py-8"
      style={{ backgroundColor: "rgba(249, 250, 251, 0.65)" }}
    >
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

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Column - Main Features */}
          <div className="lg:col-span-2 space-y-4">
            {/* Smart Schedule Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Card
                className="p-4 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 bg-white"
                onClick={() => navigate("/smart-scheduler")}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold text-lg">
                        Smart Schedule
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Lịch học thông minh với AI
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Tạo lịch học tối ưu dựa trên thời gian rảnh, mục tiêu GPA và
                  thói quen học tập của bạn
                </p>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-xl transition-all duration-300">
                  Tạo lịch học mới
                </Button>
              </Card>
            </motion.div>

            {/* AI Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4 }}
            >
              <Card
                className="p-4 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-300 bg-white"
                onClick={() => navigate("/smart-study")}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold text-lg">
                        AI Summary
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Tóm tắt tài liệu thông minh
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Upload PDF/slide, nhận tóm tắt tự động, flashcard và quiz để
                  ôn tập hiệu quả
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                    <FileText className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-purple-700">
                      Summary
                    </span>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors">
                    <BookOpen className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-pink-700">
                      Flashcard
                    </span>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                    <Target className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-indigo-700">
                      Quiz
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Study Room Card - NEW! */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ y: -4 }}
            >
              <Card
                className="p-4 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-indigo-300 bg-white relative overflow-hidden"
                onClick={() => navigate("/study-rooms")}
              >
                <div className="absolute top-0 right-0 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-bl-xl">
                  NEW ✨
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold text-lg">
                        Study Room
                      </h3>
                      <p className="text-gray-500 text-sm">Học nhóm online</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Tạo phòng học ảo với Pomodoro timer, shared notes và goals
                  tracking cùng bạn bè
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 bg-indigo-50 rounded-xl">
                    <Clock className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-indigo-700">
                      Timer
                    </span>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-purple-700">
                      Goals
                    </span>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-xl">
                    <BookOpen className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-pink-700">
                      Notes
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Study Health Score Card - UPGRADED */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <Card className="p-4 hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-green-50/40 to-emerald-50/60 shadow-lg hover:shadow-green-200/50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-green-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-green-300/50 transition-all duration-300">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-bold text-xl">
                        Study Health Score
                      </h3>
                      <p className="text-gray-600 text-sm font-medium">
                        7 ngày qua
                      </p>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-gradient-to-r from-green-100 via-emerald-100 to-green-200 text-green-800 rounded-2xl text-sm font-bold shadow-lg">
                    📈 ↑ {improvementPercent}%
                  </div>
                </div>

                {/* Overall Score with Badge */}
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 rounded-2xl shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-800 font-semibold text-lg">
                      Điểm hiện tại
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {studyHealth.score}/100
                      </span>
                      <div className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl text-sm font-bold shadow-lg animate-bounce">
                        ⭐ Xuất sắc!
                      </div>
                    </div>
                  </div>
                  <div className="relative mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 h-4 rounded-full shadow-lg transition-all duration-1000 ease-out"
                        style={{ width: `${studyHealth.score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="px-3 py-2 bg-white rounded-xl shadow-sm font-medium">
                      💡 {studyInsight}
                    </span>
                  </div>
                </div>

                {/* 7 Days Line Chart */}
                {chartData.length > 0 && (
                  <div className="mb-4 p-3 bg-white rounded-2xl shadow-lg border-2 border-gray-100">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      📊 Tiến độ 7 ngày
                    </h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          domain={[0, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "2px solid #10b981",
                            borderRadius: "12px",
                            fontSize: "13px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="url(#gradient)"
                          strokeWidth={4}
                          dot={{
                            fill: "#10b981",
                            r: 5,
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                          activeDot={{
                            r: 8,
                            fill: "#fbbf24",
                            stroke: "#fff",
                            strokeWidth: 3,
                            filter:
                              "drop-shadow(0 4px 8px rgba(251, 191, 36, 0.4))",
                          }}
                        />
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#059669" />
                            <stop offset="100%" stopColor="#047857" />
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-gray-600 text-center mt-3 font-medium">
                      🚀 {chartData[0]?.label} →{" "}
                      {chartData[chartData.length - 1]?.label} trong 7 ngày 🎉
                    </p>
                  </div>
                )}

                {/* Optimal Study Time Insight */}
                {optimalTime && (
                  <div className="p-4 bg-blue-50 rounded-xl mb-4">
                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Giờ học tối ưu của bạn
                        </p>
                        <p className="text-sm text-blue-700">
                          {optimalTime.insight}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {optimalTime.tags?.map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                            >
                              {tag === "Giờ vàng" ? "⭐" : "😴"} {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Metrics */}
                <div className="space-y-5">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        👥 Tỷ lệ tham gia lớp
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {studyHealth.attendance}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-3 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full shadow-lg transition-all duration-1000"
                        style={{ width: `${studyHealth.attendance}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        📝 Hoàn thành bài tập
                      </span>
                      <span className="text-lg font-bold text-purple-600">
                        {studyHealth.assignments}%
                      </span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-3 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full shadow-lg transition-all duration-1000"
                        style={{ width: `${studyHealth.assignments}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        🎯 Điểm trung bình
                      </span>
                      <span className="text-lg font-bold text-cyan-600">
                        {studyHealth.performance}%
                      </span>
                    </div>
                    <div className="w-full bg-cyan-200 rounded-full h-3 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-3 rounded-full shadow-lg transition-all duration-1000"
                        style={{ width: `${studyHealth.performance}%` }}
                      ></div>
                    </div>
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
            <Card className="p-3 sticky top-24">
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
                          className={`p-4 rounded-xl border-2 transition-all shadow-md ${
                            isCurrent
                              ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-blue-200/50"
                              : isCompleted
                              ? "border-gray-200 bg-gray-50 opacity-60"
                              : "border-gray-200 hover:border-blue-300 hover:shadow-lg"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-gray-900 font-semibold">
                              {classItem.course_name}
                            </span>
                            {isCurrent && (
                              <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-xs font-bold animate-pulse">
                                🔴 Đang diễn ra
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
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
                            📍 Phòng {classItem.room || "TBA"}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      Không có lớp học hôm nay
                    </p>
                    <p className="text-gray-400 text-sm">
                      Hãy tận dụng thời gian để tự học! 📚
                    </p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate("/smart-scheduler")}
              >
                Xem lịch đầy đủ
              </Button>

              {/* Help Request Button */}
              <div className="mt-6 p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <h4 className="text-sm font-medium text-orange-900">
                    Cần hỗ trợ?
                  </h4>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  Gửi thông báo cho giảng viên khi bạn cần giúp đỡ về bài tập
                  hoặc học tập
                </p>
                <Button
                  onClick={handleRequestHelp}
                  disabled={sendingHelp || helpRequested}
                  className={`w-full ${
                    helpRequested
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {sendingHelp ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : helpRequested ? (
                    <>
                      <CheckCircle className="mr-2 w-4 h-4" />
                      Đã gửi thành công!
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 w-4 h-4" />
                      Yêu cầu hỗ trợ
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
