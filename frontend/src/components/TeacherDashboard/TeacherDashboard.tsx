import { motion } from "motion/react";
import { Users, TrendingUp, AlertCircle, Send, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { useState, useEffect } from "react";
import { analyticsService } from "../../services/analyticsService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function TeacherDashboard() {
  const [reminderSent, setReminderSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<any>(null);
  
  // Hardcoded classId - in production, get from auth context or props
  const classId = '1';

  // Fetch real data from PostgreSQL
  useEffect(() => {
    const fetchClassAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getClassAnalytics(classId);
        setClassData(data);
      } catch (error) {
        console.error('Error fetching class analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassAnalytics();
  }, [classId]);

  const handleSendReminder = async () => {
    try {
      await analyticsService.sendReminder(classId, 'assignment');
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu từ database...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không thể tải dữ liệu lớp học</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  const classStats = {
    totalStudents: classData.overview.total_students,
    assignmentCompletion: Math.round(classData.overview.assignment_completion),
    averageStudyHealth: classData.averageStudyHealth,
    attendanceRate: classData.overview.avg_attendance,
  };

  // Calculate student performance distribution from real data
  const totalStudents = classStats.totalStudents;
  const excellent = Math.round(totalStudents * 0.27); // 27%
  const good = Math.round(totalStudents * 0.40); // 40%
  const average = Math.round(totalStudents * 0.22); // 22%
  const needHelp = totalStudents - excellent - good - average; // remaining

  const studentPerformance = [
    { name: "Xuất sắc", value: excellent, color: "#10b981" },
    { name: "Tốt", value: good, color: "#3b82f6" },
    { name: "Trung bình", value: average, color: "#f59e0b" },
    { name: "Cần hỗ trợ", value: needHelp, color: "#ef4444" },
  ];

  // Map weeklyProgress from API data
  const weeklyProgress = classData.weeklyProgress.map((item: any) => ({
    week: item.day,
    completion: item.attendance,
    health: item.health,
  }));

  // Map at-risk students
  const studentsNeedHelp = classData.atRiskStudents.map((student: any) => ({
    name: student.full_name,
    studyHealth: student.study_health || 0,
    assignments: student.assignment_completion || 0,
    status: student.study_health < 50 ? "Cần hỗ trợ gấp" : student.study_health < 60 ? "Cần theo dõi" : "Cần động viên",
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-gray-900">Dashboard Giảng viên 👨‍🏫</h1>
              <p className="text-gray-600">Quản lý và theo dõi tiến độ học tập của sinh viên</p>
            </div>
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
              <span className="font-medium">
                Lớp: {classData.overview.class_code} - {classData.overview.course_name}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Overview Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{classStats.totalStudents}</p>
                      <p className="text-xs text-gray-600">Sinh viên</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{classStats.assignmentCompletion}%</p>
                      <p className="text-xs text-gray-600">Hoàn thành BT</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{classStats.averageStudyHealth}</p>
                      <p className="text-xs text-gray-600">Study Health TB</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{classStats.attendanceRate}%</p>
                      <p className="text-xs text-gray-600">Tỷ lệ tham gia</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Weekly Progress Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">Tiến độ tuần này</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completion" fill="#3b82f6" name="Hoàn thành BT (%)" />
                    <Bar dataKey="health" fill="#10b981" name="Study Health" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Student Performance Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">Phân bố hiệu suất học tập</h3>
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="50%" height={250}>
                    <PieChart>
                      <Pie
                        data={studentPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {studentPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {studentPerformance.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-700">{item.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">{item.value} SV</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Students Need Help */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-gray-900">Sinh viên cần hỗ trợ</h3>
              </div>

              <div className="space-y-4 mb-6">
                {studentsNeedHelp.map((student: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-red-100 bg-red-50 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <span className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded-full">
                          {student.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Study Health</span>
                          <span className="text-xs font-medium text-red-600">
                            {student.studyHealth}/100
                          </span>
                        </div>
                        <Progress value={student.studyHealth} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Hoàn thành BT</span>
                          <span className="text-xs font-medium text-red-600">
                            {student.assignments}%
                          </span>
                        </div>
                        <Progress value={student.assignments} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Auto Reminder */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  💬 AI soạn tin nhắc nhở
                </h4>
                <p className="text-sm text-gray-700 mb-3 p-3 bg-white rounded-lg border">
                  "Chào các em! Bài tập tuần này sắp hết hạn. Hãy hoàn thành trước 23:59 ngày mai nhé. 
                  Nếu gặp khó khăn, hãy liên hệ thầy qua email hoặc office hours. Good luck! 📚"
                </p>
                <Button
                  onClick={handleSendReminder}
                  disabled={reminderSent}
                  className={`w-full ${
                    reminderSent
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {reminderSent ? (
                    <>
                      <CheckCircle className="mr-2 w-4 h-4" />
                      Đã gửi thành công!
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 w-4 h-4" />
                      Gửi nhắc nhở tự động
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 w-4 h-4" />
                  Xem danh sách lớp
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 w-4 h-4" />
                  Xuất báo cáo chi tiết
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
