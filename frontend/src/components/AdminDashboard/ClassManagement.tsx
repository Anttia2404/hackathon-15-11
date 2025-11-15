import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  UserPlus,
  Search,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import adminService from '../../services/adminService';
import CreateClassModal from './CreateClassModal';
import EditClassModal from './EditClassModal';
import ManageStudentsModal from './ManageStudentsModal';

export default function ClassManagement() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showManageStudents, setShowManageStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllClasses();
      setClasses(data.classes);
    } catch (error) {
      console.error('Load classes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (data: any) => {
    try {
      await adminService.createClass(data);
      setShowCreateModal(false);
      loadClasses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleUpdateClass = async (data: any) => {
    try {
      await adminService.updateClass(selectedClass.class_id, data);
      setShowEditModal(false);
      setSelectedClass(null);
      loadClasses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEditClass = (cls: any) => {
    setSelectedClass(cls);
    setShowEditModal(true);
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa lớp học này?')) return;
    
    try {
      await adminService.deleteClass(id);
      loadClasses();
    } catch (error) {
      console.error('Delete class error:', error);
    }
  };

  const handleManageStudents = (cls: any) => {
    setSelectedClass(cls);
    setShowManageStudents(true);
  };

  const filteredClasses = classes.filter(cls =>
    cls.class_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.course?.course_name || cls.Course?.course_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm lớp học..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
        >
          <Plus className="w-5 h-5" />
          Tạo lớp mới
        </Button>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">Không tìm thấy lớp học nào</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredClasses.map((cls, index) => (
              <motion.div
                key={cls.class_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {cls.class_code}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {cls.course?.course_name || cls.Course?.course_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClass(cls)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.class_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Giảng viên:</span>
                      <span className="font-medium text-gray-900">
                        {cls.teacher?.User?.full_name || cls.Teacher?.User?.full_name || 'Chưa có'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Học kỳ:</span>
                      <span className="font-medium text-gray-900">
                        {cls.semester} - {cls.year}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phòng:</span>
                      <span className="font-medium text-gray-900">
                        {cls.room || 'Chưa có'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {cls.enrollment_count || 0}/{cls.max_students} sinh viên
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleManageStudents(cls)}
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Quản lý SV
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateClassModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateClass}
        />
      )}

      {showEditModal && selectedClass && (
        <EditClassModal
          classData={selectedClass}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClass(null);
          }}
          onUpdate={handleUpdateClass}
        />
      )}

      {showManageStudents && selectedClass && (
        <ManageStudentsModal
          classData={selectedClass}
          onClose={() => {
            setShowManageStudents(false);
            setSelectedClass(null);
            loadClasses();
          }}
        />
      )}
    </div>
  );
}
