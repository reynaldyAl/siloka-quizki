import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import LeaderboardPage from './pages/LeaderboardPage'; // Added LeaderboardPage import
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import CreateQuestionPage from './pages/admin/CreateQuestionPage';
import EditQuestionPage from './pages/admin/EditQuestionPage';
import CreateQuizPage from './pages/admin/CreateQuizPage';
import EditQuizPage from './pages/admin/EditQuizPage';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to login
        navigate('/login', { 
          replace: true, 
          state: { from: location.pathname } 
        });
      } else if (requireAdmin && user?.role !== 'admin') {
        // Redirect non-admin users attempting to access admin routes
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, loading, user, requireAdmin, navigate, location]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || (requireAdmin && user?.role !== 'admin')) {
    return null; // Will redirect via useEffect
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
              
              {/* Leaderboard Route */}
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              
              {/* Quiz Routes */}
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
              
              {/* Admin Routes - Question Management */}
              <Route path="/admin/create-question" element={
                <ProtectedRoute requireAdmin={true}>
                  <CreateQuestionPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/edit-question/:id" element={
                <ProtectedRoute requireAdmin={true}>
                  <EditQuestionPage />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes - Quiz Management */}
              <Route path="/admin/create-quiz" element={
                <ProtectedRoute requireAdmin={true}>
                  <CreateQuizPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/edit-quiz/:id" element={
                <ProtectedRoute requireAdmin={true}>
                  <EditQuizPage />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </QuizProvider>
      </AuthProvider>
    </div>
  );
}

export default App;