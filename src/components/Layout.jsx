import React from 'react';
import NavBar from './NavBar';
import NavList from './NavList';
import { useAuth } from '../context/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // If user is not logged in and trying to access protected routes, redirect to login
  const protectedRoutes = ['/dashboard', '/deposits', '/chat'];
  const isProtectedRoute = protectedRoutes.includes(location.pathname);

  if (isProtectedRoute && !currentUser) {
    return <Navigate to="/signin" replace />;
  }

  // If user is logged in and tries to access login page, redirect to dashboard
  if (location.pathname === '/login' && currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {currentUser && <NavBar />}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        {currentUser && (
          <div className="md:w-64 flex-shrink-0">
            <div className="sticky top-16">
              <NavList />
            </div>
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;