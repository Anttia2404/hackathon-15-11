import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  Brain,
  Calendar,
  FileText,
  BarChart3,
  Shield,
  X,
  Lock,
  Mail,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import authService from "../../services/authService";

interface HomePageProps {
  onNavigate: (page: string, userType?: "student" | "teacher") => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { isAuthenticated, user } = useAuth();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.login({ email: adminEmail, password: adminPassword });
      setShowAdminModal(false);
      onNavigate("admin-dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Calendar,
      title: "Smart Schedule",
      description: "AI tạo lịch học tối ưu theo mục tiêu và thời gian của bạn",
    },
    {
      icon: FileText,
      title: "AI Summary",
      description: "Tóm tắt tài liệu, tạo flashcard và quiz tự động",
    },
    {
      icon: BarChart3,
      title: "Study Analytics",
      description: "Theo dõi tiến độ học tập và sức khỏe học tập",
    },
    {
      icon: Brain,
      title: "AI Quiz Generator",
      description: "Tạo bài kiểm tra và bài tập tự động cho giảng viên",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      {/* Hero Section with HCMUTE Background */}
      <section 
        className="pt-20 pb-32 relative overflow-hidden min-h-screen"
        style={{
          backgroundImage: 'url(/images/2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-white/40"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center min-h-[70vh]">
            {!isAuthenticated ? (
              /* Playful, colorful design */
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                className="relative max-w-5xl"
              >
                {/* Welcome section */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-16"
                >
                  <h1 className="text-6xl md:text-7xl font-black text-white mb-3 tracking-tight">
                    WELCOME
                  </h1>
                  <p className="text-2xl md:text-3xl font-bold text-yellow-400 mb-6">
                    EduSmart Platform
                  </p>
                  <p className="text-lg text-white/90 max-w-md mx-auto leading-relaxed">
                    Nền tảng học tập thông minh với công nghệ AI
                    hỗ trợ sinh viên và giảng viên
                  </p>
                </motion.div>

                {/* Cards with playful design */}
                <div className="flex flex-col sm:flex-row gap-8 justify-center px-4">
                {/* Student & Teacher Card - Playful */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -12, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate("login")}
                  className="cursor-pointer group"
                >
                  <div 
                    style={{ backgroundColor: '#f8f9ff' }}
                    className="relative p-8 rounded-[2.5rem] shadow-2xl hover:shadow-purple-400/40 transition-all duration-300 border-0 min-w-[280px] overflow-hidden"
                  >
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-300 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    
                    <div className="relative flex flex-col items-center text-center">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.15 }}
                        transition={{ duration: 0.7, type: "spring" }}
                        className="w-28 h-28 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl transform -rotate-3 group-hover:rotate-0 transition-transform"
                      >
                        <GraduationCap className="w-14 h-14 text-white" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        Continue
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-6 font-medium">
                        Sinh viên & Giảng viên
                      </p>
                      
                      <div className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full font-semibold text-sm group-hover:from-purple-600 group-hover:to-indigo-600 transition-all shadow-lg">
                        Tiếp tục →
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Admin Card - Playful */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ y: -12, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdminModal(true)}
                  className="cursor-pointer group"
                >
                  <div 
                    style={{ backgroundColor: '#fff8f0' }}
                    className="relative p-8 rounded-[2.5rem] shadow-2xl hover:shadow-orange-400/40 transition-all duration-300 border-0 min-w-[280px] overflow-hidden"
                  >
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-300 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    
                    <div className="relative flex flex-col items-center text-center">
                      <motion.div
                        whileHover={{ rotate: -360, scale: 1.15 }}
                        transition={{ duration: 0.7, type: "spring" }}
                        className="w-28 h-28 bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl transform rotate-3 group-hover:rotate-0 transition-transform"
                      >
                        <Shield className="w-14 h-14 text-white" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                        Admin
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-6 font-medium">
                        Quản trị viên
                      </p>
                      
                      <div className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full font-semibold text-sm group-hover:from-orange-600 group-hover:to-yellow-600 transition-all shadow-lg">
                        Truy cập →
                      </div>
                    </div>
                  </div>
                </motion.div>
                </div>
              </motion.div>
            ) : (
              /* Show welcome message when logged in */
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-2xl mx-auto"
              >
                <div className="relative">
                  {/* Decorative background elements */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                  
                  {/* Main card */}
                  <div className="relative bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
                    {/* Icon with animated ring */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="relative w-24 h-24 mx-auto mb-6"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                      <div className="absolute inset-1 bg-white rounded-full"></div>
                      <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-12 h-12 text-white" />
                      </div>
                    </motion.div>

                    {/* Welcome text */}
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
                    >
                      Chào mừng trở lại! 👋
                    </motion.h2>
                    
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-2xl font-semibold text-gray-800 mb-6"
                    >
                      {user?.full_name}
                    </motion.p>

                    {/* Divider */}
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6"></div>

                    {/* Instructions */}
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-gray-600 text-lg mb-8"
                    >
                      Sử dụng thanh điều hướng phía trên để truy cập các tính năng
                    </motion.p>

                    {/* Status badge */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full"
                    >
                      <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-green-700 font-medium">Đã đăng nhập</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 text-gray-900">Tính năng nổi bật</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Công nghệ AI hỗ trợ toàn diện cho cả sinh viên và giảng viên
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Admin Portal</h3>
                    <p className="text-sm opacity-90">Đăng nhập quản trị viên</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang đăng nhập...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5" />
                      Đăng nhập
                    </div>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
