import api from "../config/api";

export interface Deadline {
  deadline_id: string;
  student_id: string;
  class_id?: string;
  title: string;
  description?: string;
  due_date: string;
  estimated_hours?: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "overdue";
  created_at: string;
  completed_at?: string;
}

export interface CreateDeadlineData {
  title: string;
  description?: string;
  due_date: string;
  estimated_hours?: number;
  priority?: "low" | "medium" | "high" | "urgent";
  class_id?: string;
}

export interface StudyPlan {
  plan_id: string;
  student_id: string;
  plan_date: string;
  study_mode: "relaxed" | "normal" | "sprint";
  ai_summary?: string;
  created_at: string;
}

export interface Dashboard {
  student: {
    student_id: string;
    student_code?: string;
    user_id?: string;
    gpa?: number;
    target_gpa?: number;
    total_classes: number;
    User?: {
      full_name: string;
      email: string;
    };
  };
  pending_deadlines: number;
  deadlines: Deadline[];
  health_score: {
    overall_score: number;
    attendance_score: number;
    assignment_completion_score: number;
    performance_score: number;
  };
}

class StudentService {
  async getDashboard(): Promise<Dashboard> {
    const response = await api.get("/students/dashboard");
    return response.data;
  }

  async getDeadlines(status?: string): Promise<Deadline[]> {
    const params = status ? { status } : {};
    const response = await api.get("/students/deadlines", { params });
    return response.data.deadlines;
  }

  async createDeadline(data: CreateDeadlineData): Promise<Deadline> {
    const response = await api.post("/students/deadlines", data);
    return response.data.deadline;
  }

  async updateDeadline(
    id: string,
    data: Partial<CreateDeadlineData>
  ): Promise<Deadline> {
    const response = await api.put(`/students/deadlines/${id}`, data);
    return response.data.deadline;
  }

  async getStudyPlans(date?: string): Promise<StudyPlan[]> {
    const params = date ? { date } : {};
    const response = await api.get("/students/study-plans", { params });
    return response.data.plans;
  }
}

export default new StudentService();
