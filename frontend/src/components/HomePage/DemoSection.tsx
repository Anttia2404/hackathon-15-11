import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

export function DemoSection() {
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
          <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-4">
            Giao diện Demo
          </span>
          <h2 className="mb-4 text-gray-900">
            Trải nghiệm giao diện trực quan, hiện đại
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Được thiết kế tối ưu cho mọi thiết bị, từ desktop đến mobile. 
            Dễ sử dụng, thân thiện và đầy đủ tính năng.
          </p>
        </motion.div>

        {/* Main Dashboard Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-gray-800">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMGRhc2hib2FyZCUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NjMxNzE3NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Dashboard Analytics"
              className="w-full h-auto"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="ml-2 text-gray-700">Dashboard phân tích AI</span>
            </div>
          </div>
        </motion.div>

        {/* Secondary Screenshots Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg z-10">
              <Monitor className="w-6 h-6" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl border-4 border-gray-200 group-hover:border-blue-400 transition-colors">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwY2xhc3Nyb29tfGVufDF8fHx8MTc2MzE3MTc0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Digital Classroom"
                className="w-full h-auto"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-gray-900 mb-2">Lớp học số</h3>
              <p className="text-gray-600">Tương tác thời gian thực, quản lý bài giảng trực quan</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg z-10">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl border-4 border-gray-200 group-hover:border-purple-400 transition-colors">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758270704534-fd9715bffc0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwdGVjaG5vbG9neSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2MzE3MTc0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Mobile App"
                className="w-full h-auto"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-gray-900 mb-2">Ứng dụng di động</h3>
              <p className="text-gray-600">Học mọi lúc, mọi nơi với ứng dụng tối ưu mobile</p>
            </div>
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Responsive Design', icon: Tablet },
            { label: 'Real-time Updates', icon: Monitor },
            { label: 'Cloud-based', icon: Smartphone },
            { label: 'Secure & Fast', icon: Monitor }
          ].map((item, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
              <item.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <span className="text-gray-700">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
