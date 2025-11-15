import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Trash2, Search } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import adminService from '../../services/adminService';
import teacherService from '../../services/teacherService';

interface ManageStudentsModalProps {
  classData: any;
  onClose: () => void;
  isTeacher?: boolean;
}

export default function ManageStudentsModal({ classData, onClose, isTeacher = false }: ManageStudentsModalProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'current' | 'add'>('add');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const service = isTeacher ? teacherService : adminService;
      const [enrollmentsData, studentsData] = await Promise.all([
        service.getClassEnrollments(classData.class_id),
        service.getAllStudents(),
      ]);
      console.log('Enrollments:', enrollmentsData.enrollments);
      console.log('All students:', studentsData.students);
      setEnrollments(enrollmentsData.enrollments);
      setAllStudents(studentsData.students);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sinh viên');
      return;
    }

    try {
      const service = isTeacher ? teacherService : adminService;
      await service.addStudentsToClass(classData.class_id, selectedStudents);
      setSelectedStudents([]);
      setTab('current');
      loadData();
    } catch (error) {
      console.error('Add students error:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa sinh viên này khỏi lớp?')) return;

    try {
      const service = isTeacher ? teacherService : adminService;
      await service.removeStudentFromClass(enrollmentId);
      loadData();
    } catch (error) {
      console.error('Remove student error:', error);
    }
  };

  const enrolledStudentIds = enrollments.map(e => e.student_id);
  const availableStudents = allStudents.filter(
    s => !enrolledStudentIds.includes(s.student_id)
  );

  const filteredAvailable = availableStudents.filter(s => {
    const fullName = s.User?.full_name || s.user?.full_name || '';
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <Card className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Quản lý sinh viên</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Lớp: {classData.class_code} - {classData.course?.course_name || classData.Course?.course_name}
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setTab('current')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  tab === 'current'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sinh viên hiện tại ({enrollments.length})
              </button>
              <button
                onClick={() => setTab('add')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  tab === 'add'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Thêm sinh viên
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : tab === 'current' ? (
              /* Current Students */
              <div className="space-y-2">
                {enrollments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Chưa có sinh viên nào trong lớp
                  </p>
                ) : (
                  enrollments.map(enrollment => (
                    <div
                      key={enrollment.enrollment_id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {enrollment.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {enrollment.student_code} • {enrollment.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(enrollment.enrollment_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Add Students */
              <div>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm kiếm sinh viên..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredAvailable.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Không tìm thấy sinh viên
                    </p>
                  ) : (
                    filteredAvailable.map(student => (
                      <label
                        key={student.student_id}
                        className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.student_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.student_id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.student_id));
                            }
                          }}
                          className="w-5 h-5 text-indigo-600 rounded"
                        />
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {student.User?.full_name || student.user?.full_name || 'Không có tên'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {student.student_code} • {student.User?.email || student.user?.email || 'Không có email'}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>

                {selectedStudents.length > 0 && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-indigo-900 mb-3">
                      Đã chọn {selectedStudents.length} sinh viên
                    </p>
                    <Button
                      onClick={handleAddStudents}
                      className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      <UserPlus className="w-4 h-4" />
                      Thêm vào lớp
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
