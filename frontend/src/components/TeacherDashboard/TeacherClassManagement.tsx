import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, School } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import teacherService from "../../services/teacherService";
import ManageStudentsModal from "../AdminDashboard/ManageStudentsModal";

export function TeacherClassManagement() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showManageStudents, setShowManageStudents] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getTeacherClasses();
      setClasses(data.classes);
    } catch (error) {
      console.error("Load classes error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageStudents = (cls: any) => {
    setSelectedClass(cls);
    setShowManageStudents(true);
  };

  return (
    <div className="min-h-screen w-full relative bg-white py-8">
      {/* Purple Glow Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at top right, rgba(173, 109, 244, 0.5), transparent 70%)`,
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.3), transparent 60%)`,
          filter: "blur(80px)",
        }}
      />
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <School className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quản lý lớp học
            </h1>
          </div>
          <p className="text-gray-600">
            Quản lý sinh viên trong các lớp học của bạn
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : classes.length === 0 ? (
          <Card className="p-6 text-center">
            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Bạn chưa có lớp học nào</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls, index) => (
              <motion.div
                key={cls.class_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:shadow-xl transition-shadow">
                  <div className="mb-4">
                    <h3 className="font-bold text-xl text-gray-900 mb-1">
                      {cls.class_code}
                    </h3>
                    <p className="text-gray-600">{cls.Course?.course_name}</p>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Học kỳ:</span>
                      <span className="font-medium text-gray-900">
                        {cls.semester} - {cls.year}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phòng:</span>
                      <span className="font-medium text-gray-900">
                        {cls.room || "Chưa có"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tín chỉ:</span>
                      <span className="font-medium text-gray-900">
                        {cls.Course?.credits || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">
                        {cls.enrollment_count || 0}/{cls.max_students}
                      </span>
                      <span className="text-sm text-gray-600">sinh viên</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleManageStudents(cls)}
                      className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <UserPlus className="w-4 h-4" />
                      Quản lý
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showManageStudents && selectedClass && (
          <ManageStudentsModal
            classData={selectedClass}
            onClose={() => {
              setShowManageStudents(false);
              setSelectedClass(null);
              loadClasses();
            }}
            isTeacher={true}
          />
        )}
      </div>
    </div>
  );
}

export default TeacherClassManagement;
