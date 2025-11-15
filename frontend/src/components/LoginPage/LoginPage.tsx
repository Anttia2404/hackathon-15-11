import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Building2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { useAuth } from "../../contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set isLogin based on current route
  useEffect(() => {
    setIsLogin(location.pathname === "/login");
    setError(""); // Clear error when switching
  }, [location.pathname]);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    full_name: "",
    user_type: "student" as "student" | "teacher",
    student_code: "",
    teacher_code: "",
    major: "",
    department: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(loginData);
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Navigate based on user type
      if (user.user_type === "admin") {
        navigate("/admin-dashboard");
      } else if (user.user_type === "student") {
        navigate("/student-dashboard");
      } else if (user.user_type === "teacher") {
        navigate("/teacher-dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = {
        email: registerData.email,
        password: registerData.password,
        full_name: registerData.full_name,
        user_type: registerData.user_type,
        ...(registerData.user_type === "student" && {
          student_code: registerData.student_code,
          major: registerData.major,
        }),
        ...(registerData.user_type === "teacher" && {
          teacher_code: registerData.teacher_code,
          department: registerData.department,
        }),
      };

      await register(data);
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Navigate based on user type
      if (user.user_type === "admin") {
        navigate("/admin-dashboard");
      } else if (user.user_type === "student") {
        navigate("/student-dashboard");
      } else if (user.user_type === "teacher") {
        navigate("/teacher-dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoData = (type: "student" | "teacher") => {
    if (type === "student") {
      setLoginData({
        email: "minhanh@student.edu",
        password: "password123",
      });
    } else {
      setLoginData({
        email: "nguyen.van.a@university.edu",
        password: "password123",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-8 shadow-2xl">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-gray-900 mb-2">
              {isLogin ? "Đăng nhập" : "Đăng ký"}
            </h1>
            <p className="text-gray-600">
              {isLogin ? "Chào mừng bạn trở lại!" : "Tạo tài khoản mới"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@student.edu"
                    className="pl-10"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              {/* Demo Accounts */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-3 text-center">
                  Tài khoản demo:
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => fillDemoData("student")}
                  >
                    Sinh viên
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => fillDemoData("teacher")}
                  >
                    Giảng viên
                  </Button>
                </div>
                
                {/* Quick Admin Buttons */}
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={async () => {
                      setLoading(true);
                      setError("");
                      try {
                        // Register admin
                        await register({
                          email: "admin@smartuni.edu.vn",
                          password: "123",
                          full_name: "Administrator",
                          user_type: "admin",
                        });
                        setError("✅ Admin created! Now logging in...");
                        // Auto login
                        setTimeout(async () => {
                          await login({
                            email: "admin@smartuni.edu.vn",
                            password: "123",
                          });
                          navigate("/admin-dashboard");
                        }, 1000);
                      } catch (err: any) {
                        // If already exists, try to login
                        if (err.response?.data?.message?.includes("already")) {
                          setError("Admin exists, logging in...");
                          try {
                            await login({
                              email: "admin@smartuni.edu.vn",
                              password: "123",
                            });
                            navigate("/admin-dashboard");
                          } catch (loginErr: any) {
                            setError(loginErr.response?.data?.message || "Login failed");
                          }
                        } else {
                          setError(err.response?.data?.message || "Failed to create admin");
                        }
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    ➕ Create Admin
                  </Button>
                  
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={async () => {
                      setLoading(true);
                      setError("");
                      try {
                        await login({
                          email: "admin@smartuni.edu.vn",
                          password: "123",
                        });
                        navigate("/admin-dashboard");
                      } catch (err: any) {
                        setError(err.response?.data?.message || "Admin not found. Click 'Create Admin' first!");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    👨‍💼 Login Admin
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="reg-name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="pl-10"
                    value={registerData.full_name}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        full_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reg-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="your.email@student.edu"
                    className="pl-10"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reg-password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Loại tài khoản</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={
                      registerData.user_type === "student"
                        ? "default"
                        : "outline"
                    }
                    className="flex-1"
                    onClick={() =>
                      setRegisterData({ ...registerData, user_type: "student" })
                    }
                  >
                    Sinh viên
                  </Button>
                  <Button
                    type="button"
                    variant={
                      registerData.user_type === "teacher"
                        ? "default"
                        : "outline"
                    }
                    className="flex-1"
                    onClick={() =>
                      setRegisterData({ ...registerData, user_type: "teacher" })
                    }
                  >
                    Giảng viên
                  </Button>
                </div>
              </div>

              {registerData.user_type === "student" ? (
                <>
                  <div>
                    <Label htmlFor="student-code">Mã sinh viên</Label>
                    <Input
                      id="student-code"
                      type="text"
                      placeholder="SV001"
                      value={registerData.student_code}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          student_code: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="major">Ngành học</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="major"
                        type="text"
                        placeholder="Computer Science"
                        className="pl-10"
                        value={registerData.major}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            major: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="teacher-code">Mã giảng viên</Label>
                    <Input
                      id="teacher-code"
                      type="text"
                      placeholder="TC001"
                      value={registerData.teacher_code}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          teacher_code: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Khoa</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="department"
                        type="text"
                        placeholder="Computer Science"
                        className="pl-10"
                        value={registerData.department}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            department: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
            </form>
          )}

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
              <button
                type="button"
                onClick={() => navigate(isLogin ? "/register" : "/login")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
