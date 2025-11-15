import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Main Layout Component
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-white">
      {!isLoginPage && <Navigation userType={user?.user_type as any} />}
      {children}
    </div>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route
        path="/home"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <StudentDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/smart-scheduler"
        element={
          <ProtectedRoute>
            <Layout>
              <SmartScheduler />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/smart-study"
        element={
          <ProtectedRoute>
            <Layout>
              <SmartStudy />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/study-room"
        element={
          <ProtectedRoute>
            <Layout>
              <StudyRoom />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/join-discussion"
        element={
          <ProtectedRoute>
            <Layout>
              <JoinDiscussion />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <TeacherDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/teacher-classes"
        element={
          <ProtectedRoute>
            <Layout>
              <TeacherClassManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/interactive-classroom"
        element={
          <ProtectedRoute>
            <Layout>
              <InteractiveClassroom />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
