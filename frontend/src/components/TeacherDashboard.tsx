import { motion } from 'motion/react';
import { BarChart3, Users, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface TeacherDashboardProps {
  onNavigate: (page: string) => void;
}

export function TeacherDashboard({ onNavigate }: TeacherDashboardProps) {
  const attendanceData = [
    { week: 'Tuần 1', attendance: 95 },
    { week: 'Tuần 2', attendance: 92 },
    { week: 'Tuần 3', attendance: 88 },
    { week: 'Tuần 4', attendance: 90 },
    { week: 'Tuần 5', attendance: 85 },
    { week: 'Tuần 6', attendance: 87 },
  ];

  const performanceData = [
    { test: 'Quiz 1', average: 7.5 },
    { test: 'Quiz 2', average: 8.2 },
    { test: 'Midterm', average: 7.8 },
    { test: 'Quiz 3', average: 8.5 },
    { test: 'Assignment', average: 8.0 },
  ];

  const engagementData = [
    { metric: 'Tham gia lớp học', value: 85 },
    { metric: 'Nộp bài đúng hạn', value: 78 },
    { metric: 'Tương tác câu hỏi', value: 65 },
    { metric: 'Hoàn thành bài tập', value: 82 },
  ];

  const atRiskStudents = [
    { name: 'Nguyễn Văn A', id: 'SV001', attendance: 45, performance: 5.2, risk: 'high' },
    { name: 'Trần Thị B', id: 'SV002', attendance: 60, performance: 6.0, risk: 'medium' },
    { name: 'Lê Văn C', id: 'SV003', attendance: 55, performance: 5.8, risk: 'high' },
    { name: 'Phạm Thị D', id: 'SV004', attendance: 70, performance: 6.5, risk: 'medium' },
  ];

  const classStats = {
    totalStudents: 45,
    avgAttendance: 88,
    assignmentCompletion: 82,
    atRiskCount: 8,
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
          <h1 className="mb-2 text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Quản lý lớp học: Trí tuệ nhân tạo - CS301</p>
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
              <div className="text-gray-900">{classStats.assignmentCompletion}%</div>
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
                <div className="px-2 py-1 bg-red-600 text-white rounded-lg">!</div>
              </div>
              <div className="text-gray-700 mb-1">SV nguy cơ</div>
              <div className="text-red-700">{classStats.atRiskCount} sinh viên</div>
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
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="mb-4 text-gray-900">Điểm trung bình các bài kiểm tra</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="test" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="average" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                {atRiskStudents.map((student, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`p-4 rounded-xl border-2 ${
                      student.risk === 'high'
                        ? 'border-red-200 bg-red-50'
                        : 'border-orange-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-gray-900">{student.name}</div>
                        <div className="text-gray-500">{student.id}</div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg ${
                          student.risk === 'high'
                            ? 'bg-red-600 text-white'
                            : 'bg-orange-600 text-white'
                        }`}
                      >
                        {student.risk === 'high' ? 'Cao' : 'Trung bình'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <div>Điểm danh: {student.attendance}%</div>
                      <div>Điểm TB: {student.performance}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-blue-700 mb-2">
                  AI đề xuất: Cần can thiệp sớm với {atRiskStudents.length} sinh viên
                </p>
                <button className="text-blue-600 hover:underline">
                  Xem chi tiết và đề xuất hỗ trợ →
                </button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
