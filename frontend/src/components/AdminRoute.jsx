import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, parseJwt, isTokenExpired } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || '';

export default function AdminRoute({ children }) {
  const location = useLocation();
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const verifyAccess = async () => {
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        setAuthorized(false);
        return;
      }

      const decoded = parseJwt(token);
      if (decoded?.role && decoded.role !== 'admin' && !decoded?.isAdmin) {
        setAuthorized(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          setAuthorized(false);
          return;
        }
        const userData = await res.json();
        setAuthorized(userData.role === 'admin' || userData.isAdmin === true);
      } catch (err) {
        console.error('Eroare validare admin:', err);
        setAuthorized(false);
      }
    };

    verifyAccess();
  }, []);

  if (authorized === null) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Se verifică accesul de administrator...</div>;
  }
  if (!authorized) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
