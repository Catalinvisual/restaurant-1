// utils/auth.js
export const getToken = () => localStorage.getItem('accessToken');

export const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const isAdmin = () => {
  const token = getToken();
  if (!token) return false;
  const decoded = parseJwt(token);
  return decoded?.role === 'admin';
};

export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = parseJwt(token);
  return decoded?.role || null;
};


export function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
}
