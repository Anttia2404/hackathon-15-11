import { motion } from 'motion/react';
import { AlertCircle, Clock, FileX, TrendingDown } from 'lucide-react';

const problems = [
  {
    icon: Clock,
    title: 'Quản lý thủ công tốn thời gian',
    description: 'Điểm danh giấy tờ, nhập liệu thủ công, lãng phí hàng giờ mỗi ngày'
  },
  {
    icon: FileX,
    title: 'Dữ liệu phân tán, khó truy cập',
    description: 'Thông tin nằm rải rác nhiều hệ thống, khó tổng hợp và phân tích'
  },
  {
    icon: TrendingDown,
    title: 'Thiếu cá nhân hoá trong học tập',
    description: 'Một chương trình cho tất cả, không phù hợp với từng sinh viên'
  },
  {
    icon: AlertCircle,
    title: 'Phản hồi chậm, hỗ trợ hạn chế',
    description: 'Sinh viên khó tiếp cận hỗ trợ, câu hỏi không được giải đáp kịp thời'
  }
];

export function ProblemSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full mb-4">
            Thách thức hiện tại
          </span>
          <h2 className="mb-4 text-gray-900">
            Những hạn chế của giáo dục truyền thống
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Các trường đại học đang đối mặt với nhiều thách thức trong việc quản lý, 
            giảng dạy và nâng cao trải nghiệm học tập
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <problem.icon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-gray-900">{problem.title}</h3>
              <p className="text-gray-600">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
