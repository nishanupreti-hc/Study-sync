import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthWrapper from './components/AuthWrapper';
import Sidebar from './components/Sidebar';
import MiniPomodoroWidget from './components/MiniPomodoroWidget';
import Dashboard from './pages/Dashboard';
import UltimateDashboard from './pages/UltimateDashboard';
import EnhancedPomodoroPage from './pages/EnhancedPomodoroPage';
import PythonCourse from './pages/courses/PythonCourse';
import JavaScriptCourse from './pages/courses/JavaScriptCourse';
import JavaCourse from './pages/courses/JavaCourse';
import CppCourse from './pages/courses/CppCourse';
import HTMLCSSCourse from './pages/courses/HTMLCSSCourse';
import SQLCourse from './pages/courses/SQLCourse';
import TeamPage from './pages/TeamPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StudyPage from './pages/StudyPage';
import './index.css';

const AppContent = () => {
  const { user, userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  if (!user) {
    return <AuthWrapper />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentUser={{
          id: user.uid,
          name: userProfile?.displayName || user.email,
          level: userProfile?.progress?.level || 1,
          xp: userProfile?.progress?.xp || 0
        }}
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Routes>
          <Route path="/" element={<UltimateDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ultimate" element={<UltimateDashboard />} />
          <Route path="/pomodoro" element={<EnhancedPomodoroPage />} />
          <Route path="/study/:subject" element={<StudyPage />} />
          <Route path="/course/python" element={<PythonCourse />} />
          <Route path="/course/javascript" element={<JavaScriptCourse />} />
          <Route path="/course/java" element={<JavaCourse />} />
          <Route path="/course/cpp" element={<CppCourse />} />
          <Route path="/course/html-css" element={<HTMLCSSCourse />} />
          <Route path="/course/sql" element={<SQLCourse />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/ultimate" replace />} />
        </Routes>
      </div>
      
      {/* Mini Pomodoro Widget - appears on every page */}
      <MiniPomodoroWidget />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
