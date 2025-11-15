import { useState } from "react";
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

interface LoginPageProps {
  onLoginSuccess: (userType: "student" | "teacher") => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      onLoginSuccess(user.user_type);
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
      onLoginSuccess(user.user_type);
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
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(/images/1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="p-0 shadow-2xl overflow-hidden bg-white" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', borderRadius: '2rem' }}>
          {/* Header with Gradient and Rounded Bottom */}
          <div 
            className="py-8 text-center relative"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
              borderRadius: '2rem 2rem 3rem 3rem'
            }}
          >
            <div className="w-20 h-20 bg-white/25 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              {isLogin ? "Đăng Nhập" : "Đăng Ký"}
            </h1>
            <p className="text-white/90 text-sm font-medium">
              {isLogin ? "Chào mừng bạn trở lại!" : "Tạo tài khoản mới"}
            </p>
          </div>

          <div className="p-10">
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

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div className="space-y-4">

                {/* Login Form - Simple Style */}
                {isLogin ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email"
                        className="w-full py-3 px-4 border-0 focus:ring-2 focus:ring-blue-500 text-sm bg-gray-100"
                        style={{ borderRadius: '0.75rem' }}
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mật khẩu"
                        className="w-full py-3 px-4 pr-10 border-0 focus:ring-2 focus:ring-blue-500 text-sm bg-gray-100"
                        style={{ borderRadius: '0.75rem' }}
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({ ...loginData, password: e.target.value })
                        }
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                      >
                        👁️
                      </button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition-colors"
                      style={{ borderRadius: '0.75rem' }}
                      disabled={loading}
                    >
                      {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>
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
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                      disabled={loading}
                    >
                      {loading ? "Đang đăng ký..." : "Đăng ký"}
                    </Button>
                  </form>
                )}

                {/* Toggle Login/Register */}
                <div className="text-center text-sm">
                  <span className="text-gray-600">
                    {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {isLogin ? "Đăng ký" : "Đăng nhập"}
                  </button>
                </div>
              </div>

              {/* Right Column - Social Login & Demo */}
              <div className="space-y-4">
                {/* Social Login Buttons */}
                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-800">Đăng nhập với Google</span>
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-sm font-semibold">Đăng nhập với Facebook</span>
                  </button>
                </div>

                {/* Demo Accounts with Colorful Badges */}
                <div className="pt-4 border-t-2 border-gray-200">
                  <p className="text-sm text-gray-700 mb-4 text-center font-bold">
                    Tài khoản demo:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => fillDemoData("student")}
                      className="px-4 py-3 rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      style={{
                        background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                        color: '#5b21b6'
                      }}
                    >
                      🎓 Sinh viên
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoData("teacher")}
                      className="px-4 py-3 rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      style={{
                        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                        color: '#047857'
                      }}
                    >
                      👨‍🏫 Giảng viên
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
