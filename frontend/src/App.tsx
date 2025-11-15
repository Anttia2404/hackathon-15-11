import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Navigation } from "./components/layouts";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { SmartScheduler } from "./components/SmartScheduler";
import { AISummary } from "./components/AISummary";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { QuizGenerator } from "./components/QuizGenerator";

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

  const handleLoginSuccess = (type: "student" | "teacher") => {
    setUserType(type);
    setCurrentPage(
      type === "student" ? "student-dashboard" : "teacher-dashboard"
    );
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "student-dashboard":
        return <StudentDashboard onNavigate={handleNavigate} />;
      case "smart-scheduler":
        return <SmartScheduler />;
      case "ai-summary":
        return <AISummary />;
      case "teacher-dashboard":
        return <TeacherDashboard onNavigate={handleNavigate} />;
      case "quiz-generator":
        return <QuizGenerator />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userType={userType}
      />
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
