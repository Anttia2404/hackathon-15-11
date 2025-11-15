import {
  GraduationCap,
  Home,
  Calendar,
  FileText,
  LayoutDashboard,
  ClipboardList,
  LogOut,
  Users,
  BookOpen,
  Bell,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { PushNotification } from "../PushNotification/PushNotification";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string, type?: "student" | "teacher") => void;
  userType: "student" | "teacher" | null;
}

export function Navigation({
  currentPage,
  onNavigate,
  userType,
}: NavigationProps) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };
  const studentPages = [
    { id: "student-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "smart-scheduler", label: "Smart Schedule", icon: Calendar },
    { id: "ai-summary", label: "AI Summary", icon: FileText },
  ];

  const teacherPages = [
    { id: "teacher-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "quiz-generator", label: "Quiz Generator", icon: ClipboardList },
  ];

  const pages =
    userType === "student"
      ? studentPages
      : userType === "teacher"
      ? teacherPages
      : [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate("home")}
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
                variant={currentPage === "home" ? "default" : "ghost"}
                onClick={() => onNavigate("home")}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              {pages.map((page) => (
                <Button
                  key={page.id}
                  variant={currentPage === page.id ? "default" : "ghost"}
                  onClick={() => onNavigate(page.id)}
                  className="gap-2"
                >
                  <page.icon className="w-4 h-4" />
                  {page.label}
                </Button>
              ))}
            </div>
          )}

          {/* User Info & Logout */}
          {userType && user && (
            <div className="flex items-center gap-3">
              {/* Switch Mode Button */}
              {userType === "student" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate("teacher-dashboard", "teacher")}
                  className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Users className="w-4 h-4" />
                  Dành cho Giảng viên
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate("student-dashboard", "student")}
                  className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <BookOpen className="w-4 h-4" />
                  Chế độ Sinh viên
                </Button>
              )}

              {/* Notification Bell - Only for Students */}
              {userType === "student" && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 z-50">
                      <PushNotification onClose={() => setShowNotifications(false)} />
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.full_name}
                </p>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">
                  {userType === "student" ? "Sinh viên" : "Giảng viên"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
