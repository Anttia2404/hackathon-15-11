const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Get student ID from localStorage
function getStudentId(): string {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.student_id) {
        return user.student_id;
      }
    }
  } catch (error) {
    console.error('Error getting student ID:', error);
  }
  // Fallback to first student in database (Lê Minh Anh - SV001)
  return '750e8400-e29b-41d4-a716-446655440011';
}

export const api = {
  // Timetable APIs
  timetable: {
    async load(studentId?: string) {
      const id = studentId || getStudentId();
      const response = await fetch(`${API_BASE_URL}/timetable/${id}`);
      return response.json();
    },
    
    async save(slots: any[], studentId?: string) {
      const id = studentId || getStudentId();
      const response = await fetch(`${API_BASE_URL}/timetable/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id, slots }),
      });
      return response.json();
    },
  },

  // Deadline APIs
  deadlines: {
    async load(studentId?: string) {
      const id = studentId || getStudentId();
      const response = await fetch(`${API_BASE_URL}/deadlines/${id}`);
      return response.json();
    },
    
    async save(deadline: any, studentId?: string) {
      const id = studentId || getStudentId();
      const response = await fetch(`${API_BASE_URL}/deadlines/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id, deadline }),
      });
      return response.json();
    },
    
    async delete(deadlineId: string) {
      const response = await fetch(`${API_BASE_URL}/deadlines/${deadlineId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    
    async update(deadlineId: string, updates: any) {
      const response = await fetch(`${API_BASE_URL}/deadlines/${deadlineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
  },

  // Study Plan APIs
  studyPlans: {
    async load(studentId?: string, startDate?: string, endDate?: string) {
      const id = studentId || getStudentId();
      let url = `${API_BASE_URL}/study-plans/${id}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetch(url);
      return response.json();
    },
    
    async save(plan: any, studentId?: string) {
      const id = studentId || getStudentId();
      const response = await fetch(`${API_BASE_URL}/study-plans/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id, plan }),
      });
      return response.json();
    },
    
    async delete(planDate: string, studentId?: string) {
      const id = studentId || getStudentId();
      const response = await fetch(`${API_BASE_URL}/study-plans/${id}/${planDate}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    
    async deleteAll(studentId?: string) {
      const id = studentId || getStudentId();
      const response = await fetch(`${API_BASE_URL}/study-plans/${id}/all`, {
        method: 'DELETE',
      });
      return response.json();
    },
    
    async completeTask(taskId: string, isCompleted: boolean) {
      const response = await fetch(`${API_BASE_URL}/study-plans/task/${taskId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted }),
      });
      return response.json();
    },
  },

  // Preferences APIs
  preferences: {
    async load(studentId?: string) {
      const id = studentId || getStudentId();
      const response = await fetch(`${API_BASE_URL}/preferences/${id}`);
      return response.json();
    },
    
    async save(preferences: any, studentId?: string) {
      const id = studentId || getStudentId();
      const response = await fetch(`${API_BASE_URL}/preferences/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id, preferences }),
      });
      return response.json();
    },
  },
};
