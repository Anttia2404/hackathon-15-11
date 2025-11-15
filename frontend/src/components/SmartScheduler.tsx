import { motion } from 'motion/react';
import { Calendar, Plus, Sparkles, Clock, Target, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';

export function SmartScheduler() {
  const [showSchedule, setShowSchedule] = useState(false);

  const weekSchedule = [
    { day: 'Thứ 2', slots: [
      { time: '08:00-09:30', subject: 'Trí tuệ nhân tạo', type: 'lecture', color: 'bg-blue-500' },
      { time: '14:00-16:00', subject: 'Tự học: Cơ sở dữ liệu', type: 'study', color: 'bg-green-500' },
    ]},
    { day: 'Thứ 3', slots: [
      { time: '10:00-11:30', subject: 'Cơ sở dữ liệu', type: 'lecture', color: 'bg-purple-500' },
      { time: '13:00-14:30', subject: 'Lab: Lập trình web', type: 'lab', color: 'bg-orange-500' },
    ]},
    { day: 'Thứ 4', slots: [
      { time: '08:00-09:30', subject: 'Mạng máy tính', type: 'lecture', color: 'bg-indigo-500' },
      { time: '15:00-17:00', subject: 'Tự học: Trí tuệ nhân tạo', type: 'study', color: 'bg-green-500' },
    ]},
    { day: 'Thứ 5', slots: [
      { time: '10:00-11:30', subject: 'Lập trình web', type: 'lecture', color: 'bg-pink-500' },
      { time: '14:00-15:30', subject: 'Ôn tập Quiz', type: 'review', color: 'bg-yellow-500' },
    ]},
    { day: 'Thứ 6', slots: [
      { time: '08:00-09:30', subject: 'Seminar AI', type: 'seminar', color: 'bg-cyan-500' },
      { time: '13:00-15:00', subject: 'Làm đồ án nhóm', type: 'project', color: 'bg-red-500' },
    ]},
  ];

  const aiRecommendations = [
    {
      icon: Sparkles,
      title: 'Tối ưu thời gian học tập',
      description: 'Lịch của bạn cân đối giữa lý thuyết và thực hành, tránh quá tải',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Clock,
      title: 'Thời điểm học hiệu quả',
      description: 'Các môn khó được sắp xếp vào buổi sáng khi tập trung cao nhất',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Target,
      title: 'Phù hợp mục tiêu GPA 3.5+',
      description: 'Đủ thời gian ôn tập để đạt mục tiêu điểm số của bạn',
      color: 'text-purple-600 bg-purple-50'
    },
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
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-gray-900">Smart Scheduler</h1>
          </div>
          <p className="text-gray-600">Tạo lịch học thông minh với AI, tối ưu cho mục tiêu của bạn</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="p-6">
              <h3 className="mb-6 text-gray-900">Thông tin sinh viên</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subjects">Các môn học đăng ký</Label>
                  <div className="space-y-2 mt-2">
                    {['Trí tuệ nhân tạo', 'Cơ sở dữ liệu', 'Mạng máy tính', 'Lập trình web'].map((subject, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="text-gray-700">{subject}</span>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full gap-2">
                      <Plus className="w-4 h-4" />
                      Thêm môn học
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="free-time">Khung giờ rảnh ưu tiên</Label>
                  <Select defaultValue="morning">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Buổi sáng (8h-12h)</SelectItem>
                      <SelectItem value="afternoon">Buổi chiều (13h-17h)</SelectItem>
                      <SelectItem value="evening">Buổi tối (18h-21h)</SelectItem>
                      <SelectItem value="flexible">Linh hoạt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gpa">Mục tiêu GPA</Label>
                  <Select defaultValue="3.5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3.0">3.0 - Khá</SelectItem>
                      <SelectItem value="3.5">3.5 - Giỏi</SelectItem>
                      <SelectItem value="3.8">3.8 - Xuất sắc</SelectItem>
                      <SelectItem value="4.0">4.0 - Hoàn hảo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="study-style">Phong cách học tập</Label>
                  <Select defaultValue="balanced">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intensive">Tập trung cao độ</SelectItem>
                      <SelectItem value="balanced">Cân bằng</SelectItem>
                      <SelectItem value="relaxed">Nhẹ nhàng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2"
                  onClick={() => setShowSchedule(true)}
                >
                  <Zap className="w-4 h-4" />
                  Generate Schedule với AI
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Schedule Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {showSchedule ? (
              <div className="space-y-6">
                {/* Calendar View */}
                <Card className="p-6">
                  <h3 className="mb-6 text-gray-900">Lịch học được AI tạo</h3>
                  
                  <div className="space-y-4">
                    {weekSchedule.map((day, dayIndex) => (
                      <motion.div
                        key={dayIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: dayIndex * 0.1 }}
                        className="border-l-4 border-blue-500 pl-4"
                      >
                        <div className="mb-3 text-gray-900">{day.day}</div>
                        <div className="space-y-2">
                          {day.slots.map((slot, slotIndex) => (
                            <div
                              key={slotIndex}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                            >
                              <div className={`w-1 h-12 ${slot.color} rounded-full`} />
                              <div className="flex-1">
                                <div className="text-gray-900">{slot.subject}</div>
                                <div className="text-gray-500">{slot.time}</div>
                              </div>
                              <span className="px-3 py-1 bg-white rounded-lg text-gray-600 capitalize">
                                {slot.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* AI Recommendations */}
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="text-gray-900">AI Insights</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {aiRecommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-4 bg-white rounded-xl"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${rec.color}`}>
                          <rec.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-gray-900 mb-1">{rec.title}</div>
                          <p className="text-gray-600">{rec.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="mb-2 text-gray-900">Sẵn sàng tạo lịch học?</h3>
                <p className="text-gray-600 mb-6">
                  Điền thông tin bên trái và nhấn "Generate Schedule" để AI tạo lịch học tối ưu cho bạn
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <span className="text-gray-700">Tự động</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <span className="text-gray-700">AI-Powered</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <span className="text-gray-700">Tối ưu</span>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
