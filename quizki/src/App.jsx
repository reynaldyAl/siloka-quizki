import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QuizProvider } from './contexts/QuizContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';


// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import QuizListPage from './pages/quiz/QuizListPage';
import QuizDetailPage from './pages/quiz/QuizDetailPage';
import TakeQuizPage from './pages/quiz/TakeQuizPage';
import QuizResultsPage from './pages/quiz/QuizResultsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="app min-h-screen bg-gray-900 text-white font-sans">
      <AuthProvider>
        <QuizProvider>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            
            {/* Main App Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              <Route path="/quizzes" element={<QuizListPage />} />
              <Route path="/quizzes/:id" element={<QuizDetailPage />} />
              
              <Route path="/quizzes/:id/take" element={
                <ProtectedRoute>
                  <TakeQuizPage />
                </ProtectedRoute>
              } />
              
              <Route path="/quizzes/:id/results" element={
                <ProtectedRoute>
                  <QuizResultsPage />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </QuizProvider>
      </AuthProvider>
    </div>
  );
}

export default App;