import api from "../config/api";

export interface TeacherDashboard {
  classes: Array<{
    class_id: string;
    class_code: string;
    course: {
      course_name: string;
      course_code: string;
    };
  }>;
  statistics: {
    total_students: number;
    avg_attendance: number;
    at_risk_count: number;
  };
}

export interface AtRiskStudent {
  risk_id: string;
  student_id: string;
  student_code: string;
  full_name: string;
  class_code: string;
  risk_level: "low" | "medium" | "high" | "critical";
  attendance_rate: number;
  assignment_completion_rate: number;
  average_score: number;
  notes?: string;
}

export interface AttendanceRecord {
  student_id: string;
  status: "present" | "absent" | "late" | "excused";
}

export interface MarkAttendanceData {
  class_id: string;
  attendance_date: string;
  students: AttendanceRecord[];
}

class TeacherService {
  async getDashboard(): Promise<TeacherDashboard> {
    const response = await api.get("/teachers/dashboard");
    return response.data;
  }

  async getAtRiskStudents(classId?: string): Promise<AtRiskStudent[]> {
    const params = classId ? { class_id: classId } : {};
    const response = await api.get("/teachers/at-risk-students", { params });
    return response.data.at_risk_students;
  }

  async markAttendance(data: MarkAttendanceData): Promise<void> {
    await api.post("/teachers/attendance", data);
  }
}

export default new TeacherService();
