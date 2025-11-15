import { motion } from "motion/react";
import {
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

import { useTeacherDashboard, useAtRiskStudents } from "../../hooks/useTeacher";
import { useAuth } from "../../contexts/AuthContext";

interface TeacherDashboardProps {
  onNavigate: (page: string) => void;
}

export function TeacherDashboard({ onNavigate: _onNavigate }: TeacherDashboardProps) {
  const { user } = useAuth();
  const { dashboard, loading, error } = useTeacherDashboard();
  const { students: atRiskStudents, loading: loadingAtRisk } = useAtRiskStudents();

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
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboard.statistics || {};
  const classStats = {
    totalStudents: stats.total_students || 0,
    avgAttendance: Math.round(stats.avg_attendance || 0),
    assignmentCompletion: 0, // Not available yet
    atRiskCount: stats.at_risk_count || atRiskStudents?.length || 0,
  };

  const engagementData = [
    { metric: "Tham gia lớp học", value: classStats.avgAttendance },
    { metric: "Nộp bài đúng hạn", value: classStats.assignmentCompletion },
    { metric: "Tương tác câu hỏi", value: 0 },
    { metric: "Hoàn thành bài tập", value: classStats.assignmentCompletion },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">
            Chào mừng {user?.full_name || "Giảng viên"} - Quản lý{" "}
            {dashboard.classes?.length || 0} lớp học
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-gray-500 mb-1">Tổng sinh viên</div>
              <div className="text-gray-900">{classStats.totalStudents}</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-gray-500 mb-1">Điểm danh TB</div>
              <div className="text-gray-900">{classStats.avgAttendance}%</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-gray-500 mb-1">Hoàn thành BT</div>
              <div className="text-gray-900">
                {classStats.assignmentCompletion}%
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div className="px-2 py-1 bg-red-600 text-white rounded-lg">
                  !
                </div>
              </div>
              <div className="text-gray-700 mb-1">SV nguy cơ</div>
              <div className="text-red-700">
                {classStats.atRiskCount} sinh viên
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Attendance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="mb-4 text-gray-900">Tỷ lệ điểm danh theo tuần</h3>
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p>Dữ liệu chi tiết đang được cập nhật</p>
                  <p className="text-sm">
                    Điểm danh trung bình: {classStats.avgAttendance}%
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="mb-4 text-gray-900">
                Điểm trung bình các bài kiểm tra
              </h3>
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p>Dữ liệu chi tiết đang được cập nhật</p>
                  <p className="text-sm">
                    Tổng số sinh viên: {classStats.totalStudents}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Engagement Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="mb-6 text-gray-900">Mức độ tương tác lớp học</h3>
              <div className="space-y-6">
                {engagementData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">{item.metric}</span>
                      <span className="text-blue-600">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-3" />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* At Risk Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900">Sinh viên nguy cơ rớt môn</h3>
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="space-y-3">
                {loadingAtRisk ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                  </div>
                ) : atRiskStudents && atRiskStudents.length > 0 ? (
                  atRiskStudents
                    .slice(0, 4)
                    .map((student: any, index: number) => {
                      const riskLevel = student.risk_level || "medium";
                      return (
                        <motion.div
                          key={student.student_id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className={`p-4 rounded-xl border-2 ${
                            riskLevel === "high"
                              ? "border-red-200 bg-red-50"
                              : "border-orange-200 bg-orange-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.student_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.student_id}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-lg ${
                                riskLevel === "high"
                                  ? "bg-red-600 text-white"
                                  : "bg-orange-600 text-white"
                              }`}
                            >
                              {riskLevel === "high" ? "Cao" : "Trung bình"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>
                              Điểm danh:{" "}
                              {Math.round(student.attendance_rate || 0)}%
                            </div>
                            <div>
                              Điểm TB: {(student.current_gpa || 0).toFixed(1)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Không có sinh viên nguy cơ
                  </p>
                )}
              </div>
              {atRiskStudents && atRiskStudents.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
                  <p className="text-sm text-blue-700 mb-2">
                    AI đề xuất: Cần can thiệp sớm với {atRiskStudents.length}{" "}
                    sinh viên
                  </p>
                  <button className="text-sm text-blue-600 hover:underline">
                    Xem chi tiết và đề xuất hỗ trợ →
                  </button>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
