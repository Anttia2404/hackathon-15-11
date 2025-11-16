import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
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
  MapPin,
  Facebook,
  Twitter,
  Heart,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import authService from "../../services/authService";

export function HomePage() {
  const navigate = useNavigate();
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
      navigate("/admin-dashboard");
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
    <div className="min-h-screen w-full relative bg-white">
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

      {/* Hero Section with HCMUTE Background */}
      <section
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: "url(/images/2.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Simple overlay */}
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center">
            {!isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-4xl w-full"
              >
                {/* Single Card - Continue */}
                <div className="flex justify-center items-center px-4">
                  {/* Continue Card (Student & Teacher) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-auto"
                  >
                    <div className="bg-gradient-to-br from-blue-600 via-cyan-500 to-green-500 rounded-xl px-8 py-5 shadow-2xl inline-block">
                      <div className="flex flex-col items-center text-center">
                        <h3 className="text-lg font-bold text-white mb-1">
                          Nâng tầm giáo dục nhờ AI
                        </h3>

                        <p className="text-white/90 text-sm mb-4">
                          Học tập dễ dàng, hiệu quả hơn bao giờ hết
                        </p>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate("/login")}
                          className="px-8 py-2.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                        >
                          Tham Gia Ngay
                        </motion.button>
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
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
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
                      Sử dụng thanh điều hướng phía trên để truy cập các tính
                      năng
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
                      <span className="text-green-700 font-medium">
                        Đã đăng nhập
                      </span>
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
                    <p className="text-sm opacity-90">
                      Đăng nhập quản trị viên
                    </p>
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

      {/* Footer Section - Compact like reference image */}
      <footer className="relative bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Column 1: About */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-slate-200">
                HCMUTE AI Campus
              </h3>
              <p className="text-slate-400 text-sm mb-3 leading-relaxed">
                Nền tảng giáo dục thông minh, kết nối sinh viên với công nghệ AI
                tiên tiến để nâng cao chất lượng học tập.
              </p>
              <div className="flex items-start gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>1 Võ Văn Ngân, Thủ Đức, TP. Hồ Chí Minh</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-slate-200">
                Liên Kết Nhanh
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-purple-400 transition-colors"
                  >
                    Tính Năng
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-purple-400 transition-colors"
                  >
                    Về Chúng Tôi
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-purple-400 transition-colors"
                  >
                    Liên Hệ
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Social */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-slate-200">
                Theo Dõi Chúng Tôi
              </h3>
              <p className="text-slate-400 text-sm mb-3">
                Cập nhật thông tin mới nhất về các sự kiện
              </p>
              <div className="flex gap-2">
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-all"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4 text-slate-300" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all"
                  title="Twitter"
                >
                  <Twitter className="w-4 h-4 text-slate-300" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-all"
                  title="Email"
                >
                  <Mail className="w-4 h-4 text-slate-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-6 text-center">
            <p className="text-slate-400 text-sm mb-1">
              © 2025 HCMUTE AI Campus. Tất cả quyền được bảo lưu.
            </p>
            <p className="text-slate-500 text-xs flex items-center justify-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" />{" "}
              in nhóm Tứ Trụ Dev
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
