import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, isAdmin, isTokenExpired } from '../utils/auth';

export default function AdminRoute({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = getToken();
    const valid = token && !isTokenExpired(token) && isAdmin();
    setIsAuthorized(valid);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Se verifică accesul admin...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
