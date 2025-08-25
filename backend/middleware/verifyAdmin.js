'use strict';
const verifyToken = require('./verifyToken');

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) {
      console.error('❌ [verifyAdmin] Eroare din verifyToken:', err);
      return; // verifyToken a răspuns deja
    }

    console.log('🔎 [verifyAdmin] Utilizator autentificat:', req.user);

    // verificăm dacă are drepturi de admin
    if (req.user.role !== 'admin' && req.user.isAdmin !== true) {
      console.warn('⚠️ [verifyAdmin] Acces refuzat. Rol:', req.user.role, '| isAdmin:', req.user.isAdmin);
      return res.status(403).json({ error: 'Acces interzis. Doar adminii pot intra.' });
    }

    console.log('✅ [verifyAdmin] Acces permis pentru admin.');
    next();
  });
};

module.exports = verifyAdmin;
