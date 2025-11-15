const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// For demo purposes, use a hardcoded student ID
// In production, this should come from authentication
const DEMO_STUDENT_ID = '00000000-0000-0000-0000-000000000001';

export const api = {
  // Timetable APIs
  timetable: {
    async load(studentId: string = DEMO_STUDENT_ID) {
      const response = await fetch(`${API_BASE_URL}/timetable/${studentId}`);
      return response.json();
    },
    
    async save(slots: any[], studentId: string = DEMO_STUDENT_ID) {
      const response = await fetch(`${API_BASE_URL}/timetable/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, slots }),
      });
      return response.json();
    },
  },

  // Deadline APIs
  deadlines: {
    async load(studentId: string = DEMO_STUDENT_ID) {
      const response = await fetch(`${API_BASE_URL}/deadlines/${studentId}`);
      return response.json();
    },
    
    async save(deadline: any, studentId: string = DEMO_STUDENT_ID) {
      const response = await fetch(`${API_BASE_URL}/deadlines/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, deadline }),
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
    async load(studentId: string = DEMO_STUDENT_ID, startDate?: string, endDate?: string) {
      let url = `${API_BASE_URL}/study-plans/${studentId}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetch(url);
      return response.json();
    },
    
    async save(plan: any, studentId: string = DEMO_STUDENT_ID) {
      const response = await fetch(`${API_BASE_URL}/study-plans/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, plan }),
      });
      return response.json();
    },
    
    async delete(planDate: string, studentId: string = DEMO_STUDENT_ID) {
      const response = await fetch(`${API_BASE_URL}/study-plans/${studentId}/${planDate}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    
    async deleteAll(studentId: string = DEMO_STUDENT_ID) {
      const response = await fetch(`${API_BASE_URL}/study-plans/${studentId}/all`, {
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
    async load(studentId: string = DEMO_STUDENT_ID) {
      const response = await fetch(`${API_BASE_URL}/preferences/${studentId}`);
      return response.json();
    },
    
    async save(preferences: any, studentId: string = DEMO_STUDENT_ID) {
      const response = await fetch(`${API_BASE_URL}/preferences/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, preferences }),
      });
      return response.json();
    },
  },
};
