import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      >
        <CircularProgress size={50} style={{ color: 'white' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // אם אין אימות, הפנה ללוגין
    return <Navigate to="/login" replace />;
  }

  // אם יש אימות, הצג את הקומפוננט המבוקש
  return <>{children}</>;
};

export default ProtectedRoute; 