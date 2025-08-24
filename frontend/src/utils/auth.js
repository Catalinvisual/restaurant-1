// utils/auth.js

// ✅ Returnează tokenul JWT din localStorage sau sessionStorage
export const getToken = () =>
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('accessToken') ||
  null;

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
  } catch {
    return null;
  }
}

// ✅ Verifică dacă utilizatorul este admin (acceptă role sau isAdmin din payload)
export const isAdmin = () => {
  const token = getToken();
  if (!token) return false;
  const decoded = parseJwt(token);
  return decoded?.role === 'admin' || decoded?.isAdmin === true;
};

// ✅ Returnează rolul utilizatorului (admin, client etc.)
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = parseJwt(token);
  // dacă nu are "role", generează pe baza isAdmin
  if (decoded?.role) return decoded.role;
  if (decoded?.isAdmin) return 'admin';
  return 'client';
};

// ✅ Verifică dacă tokenul a expirat (sau nu există deloc)
export function isTokenExpired(token) {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  const now = Date.now();
  return payload.exp * 1000 < now;
}
