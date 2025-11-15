import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Navigation } from "./components/layouts";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { SmartScheduler } from "./components/SmartScheduler";
import { SmartStudy } from "./components/SmartStudy";
import { StudyRoom } from "./components/StudyRoom/StudyRoom";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { TeacherClassManagement } from "./components/TeacherDashboard/TeacherClassManagement";
import { InteractiveClassroom } from "./components/InteractiveClassroom";
import { JoinDiscussion } from "./components/StudentDashboard/JoinDiscussion";
import { AdminDashboard } from "./components/AdminDashboard";

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [userType, setUserType] = useState<"student" | "teacher" | null>(null);

  useEffect(() => {
    if (user) {
      setUserType(user.user_type as "student" | "teacher");
    }
  }, [user]);

  const handleNavigate = (page: string, type?: "student" | "teacher") => {
    setCurrentPage(page);
    if (type) {
      setUserType(type);
    }
  };

  const handleLoginSuccess = (type: "student" | "teacher" | "admin") => {
    setUserType(type as any);
    if (type === "admin") {
      setCurrentPage("admin-dashboard");
    } else {
      setCurrentPage(type === "student" ? "student-dashboard" : "teacher-dashboard");
    }
  };

  // Show login page only when explicitly navigated to
  if (currentPage === "login") {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Redirect to home if not authenticated and trying to access protected pages
  if (!isAuthenticated && currentPage !== "home") {
    setCurrentPage("home");
  }

  const renderPage = () => {
    switch (currentPage) {
      case "student-dashboard":
        return <StudentDashboard onNavigate={handleNavigate} />;
      case "smart-scheduler":
        return <SmartScheduler />;
      case "smart-study":
        return <SmartStudy />;
      case "study-room":
        return <StudyRoom />;
      case "join-discussion":
        return <JoinDiscussion />;
      case "teacher-dashboard":
        return <TeacherDashboard />;
      case "teacher-classes":
        return <TeacherClassManagement />;
      case "interactive-classroom":
        return <InteractiveClassroom />;
      case "admin-dashboard":
        return <AdminDashboard />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Show Navigation on all pages except login */}
      {currentPage !== "login" && (
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          userType={userType}
        />
      )}
      {renderPage()}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
