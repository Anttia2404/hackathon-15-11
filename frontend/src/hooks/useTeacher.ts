import { useState, useEffect } from "react";
import teacherService, {
  TeacherDashboard,
  AtRiskStudent,
} from "../services/teacherService";

export const useTeacherDashboard = () => {
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getDashboard();
      setDashboard(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { dashboard, loading, error, refetch: fetchDashboard };
};

export const useAtRiskStudents = (classId?: string) => {
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAtRiskStudents(classId);
      setStudents(data);
      setError(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch at-risk students"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  return { students, loading, error, refetch: fetchStudents };
};
