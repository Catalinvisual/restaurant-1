// utils/auth.js

// ✅ Returnează tokenul JWT din localStorage
export const getToken = () => localStorage.getItem('accessToken');

// ✅ Decodează un JWT și returnează payload-ul ca obiect
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

// ✅ Verifică dacă utilizatorul este admin
export const isAdmin = () => {
  const token = getToken();
  if (!token) return false;
  const decoded = parseJwt(token);
  return decoded?.role === 'admin';
};

// ✅ Returnează rolul utilizatorului (admin, user etc.)
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = parseJwt(token);
  return decoded?.role || null;
};

// ✅ Verifică dacă tokenul a expirat
export function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  const now = Date.now();
  return payload.exp * 1000 < now;
}
