// backend/middleware/verifyAdmin.js
const jwt = require('jsonwebtoken');

module.exports = function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token lipsă' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Acceptă fie role === 'admin', fie isAdmin === true (după cum e structurat JWT-ul tău)
    if (decoded.role !== 'admin' && !decoded.isAdmin) {
      return res.status(403).json({ error: 'Acces interzis. Doar adminii pot intra.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalid sau expirat' });
  }
};
