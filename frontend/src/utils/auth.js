// utils/auth.js
export const getToken = () => localStorage.getItem('accessToken');

export const parseJwt = (token) => {
  try {
    const base64 = token.split('.')[1];
    const base64Url = base64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64Url.padEnd(base64Url.length + (4 - base64Url.length % 4) % 4, '=');
    const decoded = JSON.parse(decodeURIComponent(escape(window.atob(padded))));
    return decoded;
  } catch (e) {
    console.error("❌ Eroare la decodarea JWT:", e);
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
