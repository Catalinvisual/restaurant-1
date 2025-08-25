// src/apiConfig.js
const isDev = process.env.NODE_ENV === 'development';

// În development trimitem direct spre backend-ul local (port 3001).
// În production luăm din variabila de mediu REACT_APP_API_URL.
export const API_URL = isDev
  ? "http://localhost:3001"  // fără /api aici!
  : process.env.REACT_APP_API_URL || "";

// Alias, dacă vrei să-l folosești în alte locuri
export const API_BASE_URL = API_URL;

// Helper pentru request-uri
export const apiFetch = (endpoint, options = {}) => {
  // endpoint trebuie să înceapă cu /api/...
  const url = `${API_URL}${endpoint}`;
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: options.credentials ?? 'include',
    ...options,
  });
};
