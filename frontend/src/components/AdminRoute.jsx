import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, parseJwt, isTokenExpired } from '../utils/auth';

export default function AdminRoute({ children }) {
  const location = useLocation();
  const [authorized, setAuthorized] = useState(null); // null = loading

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      setAuthorized(false);
      return;
    }

    const decoded = parseJwt(token);
    const isAdmin = decoded?.role === 'admin';

    setAuthorized(isAdmin);
  }, []);

  if (authorized === null) {
    return <div>Se verifică accesul admin...</div>;
  }

  if (!authorized) {
    return (
      <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>
        <h2>Acces restricționat</h2>
        <p>Doar administratorii pot accesa această pagină.</p>
        <Navigate to="/login" state={{ from: location.pathname }} replace />
      </div>
    );
  }

  return children;
}
