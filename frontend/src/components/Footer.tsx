import { GraduationCap, Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-white">Smart University</span>
            </div>
            <p className="text-gray-400 mb-4">
              Giải pháp công nghệ hàng đầu cho giáo dục đại học thông minh
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white mb-4">Sản phẩm</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tính năng</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Bảng giá</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Demo</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tài liệu</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white mb-4">Về chúng tôi</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Nhóm phát triển</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tin tức</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>contact@smartuni.edu.vn</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">
              © 2024 Smart University. Dự án Hackathon - Nhóm phát triển công nghệ giáo dục.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Điều khoản sử dụng
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
