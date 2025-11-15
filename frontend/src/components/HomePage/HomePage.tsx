import { motion } from "motion/react";
import {
  GraduationCap,
  Brain,
  Calendar,
  FileText,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { ProblemSection } from "./ProblemSection";
import { SolutionSection } from "./SolutionSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { DemoSection } from "./DemoSection";
import { Footer, Navigation } from "../layouts";

interface HomePageProps {
  onNavigate: (page: string, userType: "student" | "teacher") => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
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
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-white/40"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center min-h-[70vh]">
            {/* Only Buttons - Centered */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 group text-lg px-8 py-6"
                onClick={() => onNavigate("student-dashboard", "student")}
              >
                <GraduationCap className="mr-2 w-6 h-6" />
                Dành cho Sinh viên
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
                onClick={() => onNavigate("teacher-dashboard", "teacher")}
              >
                <Brain className="mr-2 w-6 h-6" />
                Dành cho Giảng viên
              </Button>
            </motion.div>
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
    </div>
  );
}
