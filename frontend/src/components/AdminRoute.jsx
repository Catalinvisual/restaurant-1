import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, isAdmin, isTokenExpired } from '../utils/auth';

export default function AdminRoute({ children }) {
  const location = useLocation();
  const token = getToken();

  const isAuthorized = token && !isTokenExpired(token) && isAdmin();

  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
