import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, isTokenExpired } from '../utils/auth';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login?expired=true', { replace: true });
    }
  }, [navigate]); // ✅ added to remove warning

  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
