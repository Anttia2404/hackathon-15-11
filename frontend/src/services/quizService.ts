import api from "../config/api";

export interface Quiz {
  quiz_id: string;
  class_id?: string;
  teacher_id: string;
  title: string;
  description?: string;
  topic?: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  total_questions: number;
  time_limit_minutes?: number;
  is_ai_generated: boolean;
  created_at: string;
}

export interface GenerateQuizData {
  title: string;
  description?: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  num_questions: number;
  class_id?: string;
}

export interface QuizQuestion {
  question_id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
  question_order: number;
}

class QuizService {
  async generateQuiz(
    data: GenerateQuizData
  ): Promise<{ quiz: Quiz; questions: QuizQuestion[] }> {
    const response = await api.post("/quizzes/generate", data);
    return response.data;
  }

  async generateQuizFromFile(
    file: File,
    difficulty: "easy" | "medium" | "hard" | "mixed" = "medium",
    numQuestions: number = 5,
    title?: string,
    classId?: string
  ): Promise<{ quiz: Quiz; questions: QuizQuestion[] }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("difficulty", difficulty);
    formData.append("num_questions", numQuestions.toString());
    if (title) formData.append("title", title);
    if (classId) formData.append("class_id", classId);

    const response = await api.post("/quizzes/generate-from-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async analyzeFile(
    file: File,
    numQuestions: number = 5,
    difficulty: "easy" | "medium" | "hard" | "mixed" = "medium"
  ): Promise<{ 
    questions: any[]; 
    summary: string;
    fileName: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("difficulty", difficulty);
    formData.append("num_questions", numQuestions.toString());

    const response = await api.post("/quizzes/analyze-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async getQuiz(quizId: string): Promise<Quiz> {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data.quiz;
  }

  async getTeacherQuizzes(): Promise<Quiz[]> {
    const response = await api.get("/quizzes/teacher");
    return response.data.quizzes;
  }
}

export default new QuizService();
