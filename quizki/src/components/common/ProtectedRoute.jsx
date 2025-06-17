// components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  console.log("Protected route check:", { 
    isAuthenticated, 
    loading, 
    path: location.pathname,
    requireAdmin,
    userRole: user?.role
  });
  
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }
  
  if (!isAuthenticated) {
    console.log(`Not authenticated - redirecting to login from ${location.pathname}`);
    // Redirect to the login page but save the attempted location
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Check for admin role if required
  if (requireAdmin && user?.role !== 'admin') {
    console.log(`Access denied - user is not admin. Redirecting from ${location.pathname}`);
    // Redirect to dashboard with access denied message
    return <Navigate to="/dashboard" state={{ accessDenied: true }} replace />;
  }
  
  return children;
};

export default ProtectedRoute;