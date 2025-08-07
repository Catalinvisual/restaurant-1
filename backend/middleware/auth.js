'use strict';

require('dotenv').config(); // 🔐 Încarcă variabilele de mediu

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token lipsă' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Format token invalid' });
  }

  const token = parts[1].trim();
  console.log('🔥 Auth header:', authHeader);
console.log('🔥 Token raw:', token);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('❌ [Auth Middleware] Eroare la verificarea tokenului:', err);
      // Personalizare răspuns în funcție de eroare
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Token expirat' });
      }
      return res.status(403).json({ error: 'Token invalid sau corupt' });
    }

    // Verificare minimală
    if (!decoded.id) {
      return res.status(403).json({ error: 'Token invalid: ID lipsă' });
    }

    // Atașează user-ul decodat la request
    req.user = {
      id: decoded.id,
      isAdmin: decoded.isAdmin || false
    };

    next();
  });
};

module.exports = verifyToken;