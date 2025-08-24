'use strict';
const verifyToken = require('./verifyToken');

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return; // verifyToken a trimis deja răspunsul de eroare

    if (req.user.role !== 'admin' && req.user.isAdmin !== true) {
      return res.status(403).json({ error: 'Acces interzis. Doar adminii pot intra.' });
    }

    next();
  });
};

module.exports = verifyAdmin;
