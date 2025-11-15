import { useState, useEffect } from "react";
import studentService, {
  Dashboard,
  Deadline,
  CreateDeadlineData,
} from "../services/studentService";

export const useStudentDashboard = () => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await studentService.getDashboard();
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

export const useDeadlines = () => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeadlines = async (status?: string) => {
    try {
      setLoading(true);
      const data = await studentService.getDeadlines(status);
      setDeadlines(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch deadlines");
    } finally {
      setLoading(false);
    }
  };

  const createDeadline = async (data: CreateDeadlineData) => {
    try {
      const newDeadline = await studentService.createDeadline(data);
      setDeadlines((prev) => [...prev, newDeadline]);
      return newDeadline;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Failed to create deadline"
      );
    }
  };

  const updateDeadline = async (
    id: string,
    data: Partial<CreateDeadlineData>
  ) => {
    try {
      const updated = await studentService.updateDeadline(id, data);
      setDeadlines((prev) =>
        prev.map((d) => (d.deadline_id === id ? updated : d))
      );
      return updated;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Failed to update deadline"
      );
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  return {
    deadlines,
    loading,
    error,
    createDeadline,
    updateDeadline,
    refetch: fetchDeadlines,
  };
};
