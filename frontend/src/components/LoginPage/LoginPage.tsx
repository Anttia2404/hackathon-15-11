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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url(/images/2.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative w-full">
          {/* Radial Gradient Background for Card */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background:
                "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
            }}
          />

          <Card className="p-8 shadow-2xl bg-transparent border-0 relative z-10">
            {/* Logo & Title */}
            <div className="text-center mb-8 relative z-20">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative w-20 h-20 mx-auto mb-4 z-20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-2xl animate-pulse z-10"></div>
                <div className="absolute inset-1 bg-white rounded-2xl z-20"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center z-30">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2"
              >
                {isLogin ? "Đăng nhập" : "Đăng ký"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-700 font-medium"
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
              <form onSubmit={handleLogin} className="space-y-4 relative z-20">
                <div>
                  <Label
                    htmlFor="email"
                    className="text-gray-700 font-semibold mb-1.5 block"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 z-10 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@student.edu"
                      className="pl-10 pr-3 border-2 focus:border-purple-500 transition-colors"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-semibold mb-1.5 block"
                  >
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 z-10 pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 pr-3 border-2 focus:border-purple-500 transition-colors"
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
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang đăng nhập...
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>

                {/* Demo Accounts */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700 mb-3 text-center font-semibold">
                    🎯 Tài khoản demo:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all font-medium"
                      onClick={() => fillDemoData("student")}
                    >
                      👨‍🎓 SV
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-medium"
                      onClick={() => fillDemoData("teacher")}
                    >
                      👨‍🏫 GV
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-2 border-pink-300 hover:border-pink-500 hover:bg-pink-50 transition-all font-medium"
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
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang đăng ký...
                    </div>
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </form>
            )}

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center relative z-20">
              <p className="text-gray-700">
                {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                <button
                  type="button"
                  onClick={() => navigate(isLogin ? "/register" : "/login")}
                  className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 transition-all"
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
