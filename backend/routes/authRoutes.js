const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

require('dotenv').config();

// 🔐 Middleware verificare access token (activează-l pentru rute protejate)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token lipsă' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token invalid' });
    req.user = decoded;
    next();
  });
};

// 📝 Înregistrare
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = email === 'catalin@yahoo.com';

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('❌ Eroare la înregistrare:', error);
    res.status(500).json({ error: 'Eroare la înregistrare' });
  }
});

// 🔐 Login cu access + refresh token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Utilizator inexistent' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Parolă incorectă' });

    const accessToken = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '365d' }
    );

    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 an
    });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('❌ Eroare la autentificare:', error);
    res.status(500).json({ error: 'Eroare la autentificare' });
  }
});

// ♻️ Reînnoiește access token
router.post('/refresh', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: 'Token lipsă' });

  const existing = await RefreshToken.findOne({ where: { token } });
  if (!existing) return res.status(403).json({ error: 'Token invalid' });

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ error: 'Token expirat sau invalid' });
  }
});

// 🚪 Logout – șterge refresh token
router.post('/logout', async (req, res) => {
  const { token } = req.body;
  await RefreshToken.destroy({ where: { token } });
  res.sendStatus(204);
});

// 👥 Obține utilizatorii (poți activa verifyToken pentru protecție)
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('❌ Eroare la obținerea utilizatorilor:', error);
    res.status(500).json({ error: 'Eroare la obținerea utilizatorilor' });
  }
});

module.exports = router;