import { GraduationCap, Home, Calendar, FileText, LayoutDashboard, ClipboardList } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userType: 'student' | 'teacher' | null;
}

export function Navigation({ currentPage, onNavigate, userType }: NavigationProps) {
  const studentPages = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'smart-scheduler', label: 'Smart Schedule', icon: Calendar },
    { id: 'ai-summary', label: 'AI Summary', icon: FileText },
  ];

  const teacherPages = [
    { id: 'teacher-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quiz-generator', label: 'Quiz Generator', icon: ClipboardList },
  ];

  const pages = userType === 'student' ? studentPages : userType === 'teacher' ? teacherPages : [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900">EduSmart</span>
          </button>

          {/* Navigation Links */}
          {userType && (
            <div className="flex items-center gap-2">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => onNavigate('home')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              {pages.map((page) => (
                <Button
                  key={page.id}
                  variant={currentPage === page.id ? 'default' : 'ghost'}
                  onClick={() => onNavigate(page.id)}
                  className="gap-2"
                >
                  <page.icon className="w-4 h-4" />
                  {page.label}
                </Button>
              ))}
            </div>
          )}

          {/* User Type Badge */}
          {userType && (
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg capitalize">
                {userType === 'student' ? 'Sinh viên' : 'Giảng viên'}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
