import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const testimonials = [
  {
    name: 'Nguyễn Minh Anh',
    role: 'Sinh viên năm 3, Khoa CNTT',
    image: 'https://images.unsplash.com/photo-1561065533-316e3142d586?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHN0dWRlbnQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjMwNjkzMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    content: 'Smart University đã thay đổi hoàn toàn cách tôi học tập. Hệ thống gợi ý cá nhân hoá giúp tôi tập trung vào những môn cần cải thiện. Điểm số của tôi đã tăng đáng kể!',
    rating: 5
  },
  {
    name: 'TS. Trần Văn Hùng',
    role: 'Giảng viên Khoa Kinh tế',
    image: 'https://images.unsplash.com/photo-1544972917-3529b113a469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFjaGVyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYzMTAwMzE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    content: 'Dashboard phân tích giúp tôi theo dõi tiến độ từng sinh viên một cách chi tiết. Tôi có thể phát hiện sớm những em gặp khó khăn và hỗ trợ kịp thời. Công cụ tuyệt vời!',
    rating: 5
  },
  {
    name: 'Lê Thị Hương',
    role: 'Sinh viên năm 2, Khoa Ngoại ngữ',
    image: 'https://images.unsplash.com/photo-1561065533-316e3142d586?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHN0dWRlbnQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjMwNjkzMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    content: 'Chatbot hỗ trợ 24/7 thật sự hữu ích. Tôi có thể hỏi về lịch học, thủ tục hành chính bất cứ lúc nào mà không cần đợi giờ hành chính. Tiện lợi và nhanh chóng!',
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full mb-4">
            Phản hồi từ người dùng
          </span>
          <h2 className="mb-4 text-gray-900">
            Họ nói gì về Smart University?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hàng nghìn sinh viên và giảng viên đã tin dùng và đánh giá cao 
            giải pháp của chúng tôi
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full p-6 hover:shadow-xl transition-shadow relative">
                <Quote className="absolute top-4 right-4 w-12 h-12 text-blue-100" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed relative z-10">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <ImageWithFallback
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { number: '50+', label: 'Trường đại học' },
            { number: '100,000+', label: 'Người dùng' },
            { number: '98%', label: 'Hài lòng' },
            { number: '4.9/5', label: 'Đánh giá' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
