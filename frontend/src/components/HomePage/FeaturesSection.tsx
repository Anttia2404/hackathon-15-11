import { motion } from 'motion/react';
import { ScanFace, BrainCircuit, Calendar, MessageCircleHeart, BarChart4, ClipboardCheck } from 'lucide-react';
import { Card } from '../ui/card';

const features = [
  {
    icon: ScanFace,
    title: 'Hệ thống điểm danh AI',
    description: 'Nhận diện khuôn mặt tự động, điểm danh chính xác trong vài giây. Giảm gian lận và tiết kiệm thời gian.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: BrainCircuit,
    title: 'Học tập cá nhân hoá',
    description: 'AI phân tích tiến độ học tập, đề xuất nội dung phù hợp với từng sinh viên. Tối ưu hiệu quả học tập.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: ClipboardCheck,
    title: 'Quản lý học vụ thông minh',
    description: 'Tự động hóa đăng ký môn học, quản lý điểm số, theo dõi tiến độ. Mọi thứ trong một nền tảng.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Calendar,
    title: 'Gợi ý lịch học tối ưu',
    description: 'Thuật toán thông minh sắp xếp lịch học phù hợp, tránh xung đột, tối ưu thời gian di chuyển.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: MessageCircleHeart,
    title: 'Chatbot hỗ trợ 24/7',
    description: 'Trợ lý ảo AI trả lời câu hỏi về học vụ, thủ tục, lịch học bất cứ lúc nào. Nhanh chóng và chính xác.',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: BarChart4,
    title: 'Dashboard phân tích cho giảng viên',
    description: 'Theo dõi tiến độ lớp học, phân tích hiệu suất sinh viên, dự đoán rủi ro. Ra quyết định dựa trên dữ liệu.',
    color: 'from-yellow-500 to-orange-500'
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full mb-4">
            Tính năng nổi bật
          </span>
          <h2 className="mb-4 text-gray-900">
            Công nghệ tiên tiến cho giáo dục hiện đại
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            6 tính năng cốt lõi giúp chuyển đổi hoàn toàn cách thức dạy, học và quản lý 
            tại trường đại học của bạn
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 border-transparent hover:border-blue-200">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="mb-4">Sẵn sàng trải nghiệm?</h3>
            <p className="mb-6 opacity-90 max-w-2xl mx-auto">
              Hàng nghìn sinh viên và giảng viên đã tin dùng giải pháp của chúng tôi. 
              Đến lượt bạn nâng tầm giáo dục ngay hôm nay.
            </p>
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors">
              Đăng ký dùng thử miễn phí
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
