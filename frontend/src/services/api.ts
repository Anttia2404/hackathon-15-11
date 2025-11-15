import apiClient from "../config/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// Get student ID from localStorage
function getStudentId(): string {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.student_id) {
        return user.student_id;
      }
    }
  } catch (error) {
    console.error("Error getting student ID:", error);
  }
  // Fallback to first student in database (Lê Minh Anh - SV001)
  return "750e8400-e29b-41d4-a716-446655440011";
}

export const api = {
  // Timetable APIs
  timetable: {
    async load(studentId?: string) {
      const id = studentId || getStudentId();
      const response = await apiClient.get(`/timetable/${id}`);
      return response.data;
    },

    async save(slots: any[], studentId?: string) {
      const id = studentId || getStudentId();
      const response = await apiClient.post("/timetable/save", {
        studentId: id,
        slots,
      });
      return response.data;
    },
  },

  // Deadline APIs
  deadlines: {
    async load(studentId?: string) {
      const id = studentId || getStudentId();
      const response = await apiClient.get(`/deadlines/${id}`);
      return response.data;
    },

    async save(deadline: any, studentId?: string) {
      const id = studentId || getStudentId();
      const response = await apiClient.post("/deadlines/save", {
        studentId: id,
        deadline,
      });
      return response.data;
    },

    async delete(deadlineId: string) {
      const response = await apiClient.delete(`/deadlines/${deadlineId}`);
      return response.data;
    },

    async update(deadlineId: string, updates: any) {
      const response = await apiClient.put(`/deadlines/${deadlineId}`, updates);
      return response.data;
    },
  },

  // Study Plan APIs
  studyPlans: {
    async load(studentId?: string, startDate?: string, endDate?: string) {
      const id = studentId || getStudentId();
      let url = `/study-plans/${id}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    },

    async save(plan: any, studentId?: string) {
      const id = studentId || getStudentId();
      const response = await apiClient.post("/study-plans/save", {
        studentId: id,
        plan,
      });
      return response.data;
    },

    async delete(planDate: string, studentId?: string) {
      const id = studentId || getStudentId();
      const response = await apiClient.delete(`/study-plans/${id}/${planDate}`);
      return response.data;
    },

    async deleteAll(studentId?: string) {
      const id = studentId || getStudentId();
      const response = await apiClient.delete(`/study-plans/${id}/all`);
      return response.data;
    },

    async completeTask(taskId: string, isCompleted: boolean) {
      const response = await apiClient.put(
        `/study-plans/task/${taskId}/complete`,
        {
          isCompleted,
        }
      );
      return response.data;
    },
  },

  // Preferences APIs
  preferences: {
    async load(studentId?: string) {
      const id = studentId || getStudentId();
      const response = await apiClient.get(`/preferences/${id}`);
      return response.data;
    },

    async save(preferences: any, studentId?: string) {
      const id = studentId || getStudentId();
      const response = await apiClient.post("/preferences/save", {
        studentId: id,
        preferences,
      });
      return response.data;
    },
  },
};
