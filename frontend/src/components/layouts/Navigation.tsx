import { useState, useEffect } from "react";
import {
  GraduationCap,
  Home,
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Bell,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { PushNotification } from "../PushNotification/PushNotification";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userType: "student" | "teacher" | "admin" | null;
}

export function Navigation({
  currentPage,
  onNavigate,
  userType,
}: NavigationProps) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Poll for notifications if student
  useEffect(() => {
    if (userType === 'student' && user) {
      const fetchNotifications = async () => {
        try {
          // Use user_id as identifier (notifications are not student-specific in current implementation)
          const userId = user.user_id;
          
          if (userId) {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/notifications/student/${userId}`
            );
            if (response.ok) {
              const data = await response.json();
              setNotifications(data.notifications || []);
            }
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };

      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [userType, user]);

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };
  const studentPages = [
    { id: "student-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "study-room", label: "Study Room", icon: MessageSquare },
    { id: "join-discussion", label: "Join Discussion", icon: MessageSquare },
    { id: "smart-scheduler", label: "Smart Schedule", icon: Calendar },
    { id: "smart-study", label: "Smart Study", icon: FileText },
  ];

  const teacherPages = [
    { id: "teacher-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "teacher-classes", label: "My Classes", icon: LayoutDashboard },
    { id: "interactive-classroom", label: "Interactive Class", icon: MessageSquare },
  ];

  const adminPages = [
    { id: "admin-dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
  ];

  const pages =
    userType === "student"
      ? studentPages
      : userType === "teacher"
      ? teacherPages
      : userType === "admin"
      ? adminPages
      : [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center h-16">
          {/* Logo - Fixed width */}
          <div className="flex-shrink-0 w-48">
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-gray-900 font-semibold">EduSmart</span>
            </button>
          </div>

          {/* Navigation Links - Centered */}
          {userType && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-4">
                <Button
                  variant={currentPage === "home" ? "default" : "ghost"}
                  onClick={() => onNavigate("home")}
                  className="gap-2 px-5 py-2 mx-1"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
                {pages.map((page) => (
                  <Button
                    key={page.id}
                    variant={currentPage === page.id ? "default" : "ghost"}
                    onClick={() => onNavigate(page.id)}
                    className="gap-2 px-5 py-2 mx-1"
                  >
                    <page.icon className="w-4 h-4" />
                    {page.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* User Info & Logout - Fixed width */}
          {userType && user && (
            <div className="flex-shrink-0 flex items-center gap-3">
              {/* Notification Bell for Students */}
              {userType === 'student' && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 hover:bg-blue-50 rounded-full transition-all hover:scale-110"
                  >
                    <Bell className="w-5 h-5 text-gray-700" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown using PushNotification component */}
                  {showNotifications && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowNotifications(false)}
                      />
                      {/* Dropdown */}
                      <div className="absolute right-0 top-full mt-2 z-50">
                        <PushNotification 
                          onClose={() => setShowNotifications(false)}
                          notifications={notifications}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.full_name}
                </p>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">
                  {userType === "student" ? "Sinh viên" : userType === "teacher" ? "Giảng viên" : "Admin"}
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
