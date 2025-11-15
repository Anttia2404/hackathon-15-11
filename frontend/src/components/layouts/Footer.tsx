import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          {/* HCMUTE AI Campus */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold">HCMUTE AI Campus</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Nền tảng giáo dục thông minh với AI, kết nối sinh viên và giảng viên tại Đại học Sư phạm Kỹ thuật TP. HCM
            </p>
            <div className="flex gap-2">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Liên Kết Nhanh */}
          <div>
            <h3 className="text-white font-semibold mb-3">Liên Kết Nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tính năng</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Về Chúng Tôi</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Hackathon 2025</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Liên Hệ</a></li>
            </ul>
          </div>

          {/* Thông Tin Liên Hệ */}
          <div>
            <h3 className="text-white font-semibold mb-3">Thông Tin Liên Hệ</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>1 Võ Văn Ngân, Thủ Đức, TP. HCM</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>+84 28 3896 4369</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>info@hcmute.edu.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
            <p className="text-gray-400 text-center md:text-left">
              © 2025 HCMUTE AI Campus. Hackathon Đại Học Thông Minh
            </p>
            <div className="flex gap-4">
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
