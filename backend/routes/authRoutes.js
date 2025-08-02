const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware opțional pentru verificarea tokenului (momentan neactivat)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token lipsă' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, 'secretKey', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token invalid' });
    req.user = decoded;
    next();
  });
};

// Înregistrare
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = email === 'catalin@yahoo.com'; // 👑 admin doar dacă email-ul e al tău

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin
    });

    console.log('✅ Utilizator salvat:', newUser.toJSON());
    res.status(201).json(newUser);
  } catch (error) {
    console.error('❌ Eroare la înregistrare:', error);
    res.status(500).json({ error: 'Eroare la înregistrare' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Utilizator inexistent' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Parolă incorectă' });

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      'secretKey',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('❌ Eroare la autentificare:', error);
    res.status(500).json({ error: 'Eroare la autentificare' });
  }
});

// Obține toți utilizatorii
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // 🔒 ascundem parolele
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('❌ Eroare la obținerea utilizatorilor:', error);
    res.status(500).json({ error: 'Eroare la obținerea utilizatorilor' });
  }
});

module.exports = router;