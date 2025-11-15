import api from '../config/api';

export interface TeacherDashboard {
  classes: any[];
  statistics: {
    total_students: number;
    avg_attendance: number;
    at_risk_count: number;
  };
  // Flattened properties for easier access
  total_students?: number;
  average_attendance?: number;
  avg_attendance?: number;
  assignment_completion_rate?: number;
  active_courses?: number;
  at_risk_count?: number;
}

export interface AtRiskStudent {
  student_id: string;
  student_code: string;
  full_name: string;
  class_code: string;
  risk_level: string;
  risk_factors: any;
  last_updated: string;
}

class TeacherService {
  // Get teacher dashboard
  async getDashboard(): Promise<TeacherDashboard> {
    const response = await api.get('/teachers/dashboard');
    return response.data;
  }

  // Get at-risk students
  async getAtRiskStudents(classId?: string): Promise<AtRiskStudent[]> {
    const params = classId ? { class_id: classId } : {};
    const response = await api.get('/teachers/at-risk-students', { params });
    return response.data.at_risk_students || [];
  }

  // Get teacher's classes
  async getTeacherClasses() {
    const response = await api.get('/teachers/classes');
    return response.data;
  }

  // Get class enrollments
  async getClassEnrollments(classId: string) {
    const response = await api.get(`/teachers/classes/${classId}/enrollments`);
    return response.data;
  }

  // Get all students
  async getAllStudents() {
    const response = await api.get('/teachers/students');
    return response.data;
  }

  // Add students to class
  async addStudentsToClass(classId: string, studentIds: string[]) {
    const response = await api.post('/teachers/classes/add-students', {
      class_id: classId,
      student_ids: studentIds,
    });
    return response.data;
  }

  // Remove student from class
  async removeStudentFromClass(enrollmentId: string) {
    const response = await api.delete(`/teachers/enrollments/${enrollmentId}`);
    return response.data;
  }
}

export default new TeacherService();
