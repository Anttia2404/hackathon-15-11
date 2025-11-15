import api from '../config/api';

class AdminService {
  // Dashboard
  async getDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  }

  // Classes
  async getAllClasses() {
    const response = await api.get('/admin/classes');
    return response.data;
  }

  async createClass(data: any) {
    const response = await api.post('/admin/classes', data);
    return response.data;
  }

  async updateClass(id: string, data: any) {
    const response = await api.put(`/admin/classes/${id}`, data);
    return response.data;
  }

  async deleteClass(id: string) {
    const response = await api.delete(`/admin/classes/${id}`);
    return response.data;
  }

  async getClassEnrollments(id: string) {
    const response = await api.get(`/admin/classes/${id}/enrollments`);
    return response.data;
  }

  // Teachers
  async getAllTeachers() {
    const response = await api.get('/admin/teachers');
    return response.data;
  }

  // Students
  async getAllStudents() {
    const response = await api.get('/admin/students');
    return response.data;
  }

  async addStudentsToClass(classId: string, studentIds: string[]) {
    const response = await api.post('/admin/classes/add-students', {
      class_id: classId,
      student_ids: studentIds,
    });
    return response.data;
  }

  async removeStudentFromClass(enrollmentId: string) {
    const response = await api.delete(`/admin/enrollments/${enrollmentId}`);
    return response.data;
  }

  // Courses
  async getAllCourses() {
    const response = await api.get('/admin/courses');
    return response.data;
  }
}

export default new AdminService();
