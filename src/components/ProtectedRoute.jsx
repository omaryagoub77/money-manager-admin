import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // In a real application, you would check for admin privileges here
  // For now, we're just demonstrating the component structure
  const isAdmin = true; // This would typically come from context or props
  
  if (!isAdmin) {
    return <Navigate to="/admin" />;
  }
  
  return children;
};

export default ProtectedRoute;