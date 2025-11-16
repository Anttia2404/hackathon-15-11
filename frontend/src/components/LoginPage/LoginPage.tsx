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

  const fillDemoData = (type: "student" | "teacher" | "admin") => {
    if (type === "student") {
      setLoginData({
        email: "daonguyennhatanh0910@gmail.com",
        password: "123",
      });
    } else if (type === "teacher") {
      setLoginData({
        email: "test109@qa.team",
        password: "123",
      });
    } else {
      setLoginData({
        email: "admin@university.edu",
        password: "password123",
      });
    }
  };

  const handleAdminLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await login({
        email: "admin@smartuni.edu.vn",
        password: "123",
      });
      navigate("/admin-dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Đăng nhập admin thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-white flex items-center justify-center p-4 overflow-hidden">
      {/* Purple Glow Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at top right, rgba(173, 109, 244, 0.5), transparent 70%)`,
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.3), transparent 60%)`,
          filter: "blur(80px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="relative w-full">
          {/* Clean gradient background */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, #f8f9ff 50%, #f0f2ff 100%)",
            }}
          />

          <Card className="p-6 shadow-2xl bg-transparent border-0 relative z-10 backdrop-blur-sm">
            {/* Logo & Title */}
            <div className="text-center mb-5 relative z-20">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative w-14 h-14 mx-auto mb-3 z-20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-xl shadow-lg z-10"></div>
                <div className="absolute inset-0.5 bg-white rounded-xl z-20"></div>
                <div className="absolute inset-1 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center z-30">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1.5 tracking-tight"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {isLogin ? "Đăng nhập" : "Đăng ký"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-base text-gray-600 font-normal"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {isLogin ? "Chào mừng bạn trở lại! 👋" : "Tạo tài khoản mới 🎓"}
              </motion.p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 relative z-20"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Login Form */}
            {isLogin ? (
              <form
                onSubmit={handleLogin}
                className="space-y-3.5 relative z-20"
              >
                <div>
                  <Label
                    htmlFor="email"
                    className="text-gray-800 font-semibold text-sm mb-1.5 block"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 z-10 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@student.edu"
                      className="pl-10 pr-3 h-10 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label
                      htmlFor="password"
                      className="text-gray-800 font-semibold text-sm"
                      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    >
                      Mật khẩu
                    </Label>
                    <button
                      type="button"
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                      onClick={() => alert("Tính năng đang phát triển")}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 z-10 pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 pr-3 h-10 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
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
                  className="w-full h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01] mt-1"
                  disabled={loading}
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-sm">Đang đăng nhập...</span>
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>

                {/* Demo Accounts */}
                <div className="pt-3 border-t border-gray-200 mt-4">
                  <p
                    className="text-xs text-gray-600 mb-2 text-center font-medium"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    🎯 Tài khoản demo
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all font-medium"
                      onClick={() => fillDemoData("student")}
                    >
                      👨‍🎓 SV
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all font-medium"
                      onClick={() => fillDemoData("teacher")}
                    >
                      👨‍🏫 GV
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all font-medium"
                      onClick={handleAdminLogin}
                      disabled={loading}
                    >
                      {loading ? "⏳" : "👑"} Admin
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              /* Register Form */
              <form
                onSubmit={handleRegister}
                className="space-y-4 relative z-20"
              >
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
                        setRegisterData({
                          ...registerData,
                          user_type: "student",
                        })
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
                        setRegisterData({
                          ...registerData,
                          user_type: "teacher",
                        })
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
                  className="w-full h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01]"
                  disabled={loading}
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-sm">Đang đăng ký...</span>
                    </div>
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </form>
            )}

            {/* Toggle Login/Register */}
            <div className="mt-4 text-center relative z-20">
              <p
                className="text-sm text-gray-600"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                <button
                  type="button"
                  onClick={() => navigate(isLogin ? "/register" : "/login")}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors underline decoration-2 underline-offset-2"
                >
                  {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
                </button>
              </p>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
