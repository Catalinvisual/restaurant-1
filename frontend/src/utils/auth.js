// utils/auth.js
export const getToken = () => localStorage.getItem('accessToken');

export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}


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
