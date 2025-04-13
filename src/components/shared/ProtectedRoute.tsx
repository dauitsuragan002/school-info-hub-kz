import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('ProtectedRoute check - Auth status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
  
  // Жүктелу күйінде бос контент қайтару
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Жүктелуде...</div>;
  }
  
  // Аутентификация жоқ болса, тек админ беттеріне кіру формасын көрсету
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Аутентификация болса, қорғалған контентті көрсету
  return <>{children}</>;
};

export default ProtectedRoute; 