import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../utils/auth";

export default function RequireAuth({ children }) {
  const location = useLocation();
  const token = getToken();

  const isAuthenticated = token && token !== "undefined";

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
