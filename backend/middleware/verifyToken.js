'use strict';
require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔎 [verifyToken] AUTH HEADER:', authHeader);

    if (!authHeader) {
      return res.status(401).json({ error: 'Token lipsă' });
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Format token invalid' });
    }

    try {
      const decoded = jwt.verify(token.trim(), process.env.JWT_SECRET);
      console.log('✅ [verifyToken] PAYLOAD DECODAT:', decoded);

      if (!decoded.id) {
        return res.status(403).json({ error: 'Token invalid: ID lipsă' });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.username || decoded.name || '',
        isAdmin: decoded.isAdmin || false,
        role: decoded.role || (decoded.isAdmin ? 'admin' : 'client')
      };

      next();
    } catch (err) {
      console.error('❌ [verifyToken] VERIFY ERROR:', err);
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Token expirat' });
      }
      return res.status(403).json({ error: 'Token invalid sau corupt' });
    }
  } catch (err) {
    console.error('❌ [verifyToken] Eroare generală:', err);
    return res.status(500).json({ error: 'Eroare internă server' });
  }
};

module.exports = verifyToken;
