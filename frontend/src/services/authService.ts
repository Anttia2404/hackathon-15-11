import api from "../config/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  user_type: "student" | "teacher";
  student_code?: string;
  teacher_code?: string;
  major?: string;
  department?: string;
}

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  user_type: "student" | "teacher" | "admin";
  avatar_url?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post("/auth/login", credentials);
    const { token, user } = response.data;

    // Save to localStorage
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data);
    const { token, user } = response.data;

    // Save to localStorage
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get("/auth/me");
    return response.data.user;
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  }

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  }
}

export default new AuthService();
