import { motion } from 'motion/react';
import { Brain, BarChart3, Users, GraduationCap, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const solutions = [
  {
    icon: Brain,
    title: 'Trí tuệ nhân tạo (AI)',
    description: 'Tự động hóa quy trình, phân tích hành vi học tập, dự đoán kết quả'
  },
  {
    icon: BarChart3,
    title: 'Dashboard phân tích',
    description: 'Trực quan hoá dữ liệu thời gian thực, báo cáo thông minh'
  },
  {
    icon: Users,
    title: 'Quản lý tập trung',
    description: 'Một nền tảng thống nhất cho sinh viên, giảng viên và quản lý'
  },
  {
    icon: GraduationCap,
    title: 'Lớp học thông minh',
    description: 'Tích hợp công nghệ vào từng phòng học, tương tác tức thì'
  }
];

const benefits = [
  'Tiết kiệm 70% thời gian quản lý hành chính',
  'Tăng 45% hiệu quả học tập của sinh viên',
  'Giảm 60% sai sót trong quản lý dữ liệu',
  'Nâng cao 90% mức độ hài lòng của người dùng'
];

export function SolutionSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
            Giải pháp Smart University
          </span>
          <h2 className="mb-4 text-gray-900">
            Chuyển đổi số toàn diện cho giáo dục
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nền tảng công nghệ tích hợp AI, Big Data và IoT để tạo ra trải nghiệm 
            học tập và quản lý thông minh, hiệu quả
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Solutions Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <solution.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="mb-2 text-gray-900">{solution.title}</h3>
                <p className="text-gray-600">{solution.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758270704534-fd9715bffc0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwdGVjaG5vbG9neSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2MzE3MTc0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Student using technology"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white"
        >
          <h3 className="mb-8 text-center">Lợi ích vượt trội</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
