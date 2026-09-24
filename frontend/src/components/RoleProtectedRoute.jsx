import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleProtectedRoute — Redirects if user doesn't have the required role.
 *
 * Usage:
 *   <RoleProtectedRoute role="admin" redirectTo="/AdminLogin">
 *     <Dashboard />
 *   </RoleProtectedRoute>
 */
const RoleProtectedRoute = ({ role, redirectTo, children }) => {
  const { isAdminLoggedIn, isUserLoggedIn, isVendorLoggedIn } = useAuth();

  const isAuthorized =
    (role === 'admin' && isAdminLoggedIn) ||
    (role === 'user' && isUserLoggedIn) ||
    (role === 'vendor' && isVendorLoggedIn);

  if (!isAuthorized) {
    return <Navigate to={redirectTo || '/'} replace />;
  }

  return children;
};

export default RoleProtectedRoute;
