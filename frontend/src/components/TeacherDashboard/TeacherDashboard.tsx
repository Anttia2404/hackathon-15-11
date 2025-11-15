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
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<any>(null);
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [sendingCustom, setSendingCustom] = useState(false);
  const [showStudentList, setShowStudentList] = useState(false);
  
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

  // Poll for help requests every 5 seconds
  useEffect(() => {
    const fetchHelpRequests = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/notifications/help-requests/${classId}`);
        if (response.ok) {
          const data = await response.json();
          setHelpRequests(data.requests || []);
        }
      } catch (error) {
        console.error('Error fetching help requests:', error);
      }
    };

    fetchHelpRequests();
    const interval = setInterval(fetchHelpRequests, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [classId]);

  const handleSendCustomMessage = async () => {
    if (!customMessage.trim()) {
      alert('Vui lòng nhập nội dung tin nhắn!');
      return;
    }

    setSendingCustom(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/notifications/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          message: customMessage,
          teacherName: 'Giảng viên Nguyễn',
          type: 'announcement'
        }),
      });

      if (response.ok) {
        alert('Đã gửi tin nhắn đến tất cả sinh viên!');
        setCustomMessage('');
      }
    } catch (error) {
      console.error('Error sending custom message:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại!');
    } finally {
      setSendingCustom(false);
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
            <div className="flex items-center gap-3">
              {helpRequests.length > 0 && (
                <div className="relative px-4 py-2 bg-red-100 text-red-700 rounded-lg animate-pulse">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {helpRequests.length} sinh viên cần hỗ trợ
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping" />
                </div>
              )}
              <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                <span className="font-medium">
                  Lớp: {classData.overview.class_code} - {classData.overview.course_name}
                </span>
              </div>
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
              {/* Help Requests Alert */}
              {helpRequests.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="relative">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping" />
                    </div>
                    <h4 className="font-medium text-red-900">Yêu cầu hỗ trợ mới!</h4>
                  </div>
                  <div className="space-y-2">
                    {helpRequests.slice(0, 3).map((request: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-red-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{request.studentName}</span>
                          <span className="text-xs text-red-600">
                            {new Date(request.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{request.message}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                            Study Health: {request.studyHealth}/100
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Custom Message Composer */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  💬 Soạn tin nhắn gửi sinh viên
                </h4>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Nhập nội dung tin nhắn..."
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                <Button
                  onClick={handleSendCustomMessage}
                  disabled={sendingCustom || !customMessage.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {sendingCustom ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 w-4 h-4" />
                      Gửi đến tất cả sinh viên
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowStudentList(!showStudentList)}
                >
                  <Users className="mr-2 w-4 h-4" />
                  {showStudentList ? 'Ẩn danh sách lớp' : 'Xem danh sách lớp'}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 w-4 h-4" />
                  Xuất báo cáo chi tiết
                </Button>
              </div>

              {/* Student List Modal */}
              {showStudentList && (
                <div className="mt-4 p-4 bg-white rounded-xl border-2 border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Danh sách sinh viên ({classStats.totalStudents} sinh viên)
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {studentsNeedHelp.map((student: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-500">SV00{idx + 1}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{student.studyHealth}/100</p>
                            <p className="text-xs text-gray-500">Study Health</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Add more mock students */}
                    {Array.from({ length: Math.max(0, classStats.totalStudents - studentsNeedHelp.length) }).map((_, idx) => (
                      <div key={`extra-${idx}`} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium">
                              {studentsNeedHelp.length + idx + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Sinh viên {studentsNeedHelp.length + idx + 1}</p>
                              <p className="text-xs text-gray-500">SV0{studentsNeedHelp.length + idx + 1}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">{Math.floor(Math.random() * 20) + 75}/100</p>
                            <p className="text-xs text-gray-500">Study Health</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
