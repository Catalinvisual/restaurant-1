'use strict';
require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token lipsă' });
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Format token invalid' });
    }

    const decoded = jwt.verify(token.trim(), process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(403).json({ error: 'Token invalid: ID lipsă' });
    }

   req.user = {
  id: decoded.id,
  email: decoded.email,
  name: decoded.username || decoded.name || '', // dacă îl ai
  isAdmin: decoded.isAdmin || false,
  role: decoded.role || (decoded.isAdmin ? 'admin' : 'client')
};

    next();
  } catch (err) {
    console.error('❌ [verifyToken] Eroare:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expirat' });
    }
    return res.status(403).json({ error: 'Token invalid sau corupt' });
  }
};

module.exports = verifyToken;
