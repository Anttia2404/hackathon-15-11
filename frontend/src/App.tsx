import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { StudentDashboard } from './components/StudentDashboard';
import { SmartScheduler } from './components/SmartScheduler';
import { AISummary } from './components/AISummary';
import { TeacherDashboard } from './components/TeacherDashboard';
import { QuizGenerator } from './components/QuizGenerator';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userType, setUserType] = useState<'student' | 'teacher' | null>(null);

  const handleNavigate = (page: string, type?: 'student' | 'teacher') => {
    setCurrentPage(page);
    if (type) {
      setUserType(type);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'student-dashboard':
        return <StudentDashboard onNavigate={handleNavigate} />;
      case 'smart-scheduler':
        return <SmartScheduler />;
      case 'ai-summary':
        return <AISummary />;
      case 'teacher-dashboard':
        return <TeacherDashboard onNavigate={handleNavigate} />;
      case 'quiz-generator':
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
