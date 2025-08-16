'use strict';

require('dotenv').config();

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
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Token expirat' });
      }
      return res.status(403).json({ error: 'Token invalid sau corupt' });
    }

    if (!decoded.id) {
      return res.status(403).json({ error: 'Token invalid: ID lipsă' });
    }

    req.user = {
      id: decoded.id,
      isAdmin: decoded.isAdmin || false,
      role: decoded.role || (decoded.isAdmin ? 'admin' : 'client')
    };

    next();
  });
};

module.exports = verifyToken;
