require('dotenv').config(); // ✅ citește direct fișierul .env


const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const ENV = process.env.NODE_ENV || 'development';
console.log(`🚦 [Auth Routes] Mediul activ: ${ENV}`);

// 🔐 Middleware verificare token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token lipsă' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Eroare la verificarea tokenului:', error.message);
    return res.status(403).json({ error: 'Token invalid' });
  }
};

// 📝 Înregistrare utilizator
router.post('/register', async (req, res) => {
  console.log("📦 Body primit:", req.body);

  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Date lipsă în formular" });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email deja folosit" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = email === 'catalin@yahoo.com';

    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isAdmin
    });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin
    });
  } catch (error) {
    console.error('❌ Eroare la înregistrare:', error);
    res.status(500).json({ error: 'Eroare la înregistrare' });
  }
});

// 🔑 Login — generează access și refresh token
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
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('❌ Eroare la login:', error);
    res.status(500).json({ error: 'Eroare la autentificare' });
  }
});

// ♻️ Reînnoire access token
router.post('/refresh', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: 'Token lipsă' });

  try {
    const existing = await RefreshToken.findOne({ where: { token } });
    if (!existing) return res.status(403).json({ error: 'Token invalid sau expirat' });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('❌ Eroare la refresh:', error);
    res.status(403).json({ error: 'Token expirat sau invalid' });
  }
});

// 🚪 Logout — șterge refresh token
router.post('/logout', async (req, res) => {
  const { token } = req.body;
  try {
    await RefreshToken.destroy({ where: { token } });
    res.sendStatus(204);
  } catch (error) {
    console.error('❌ Eroare la logout:', error);
    res.status(500).json({ error: 'Eroare la logout' });
  }
});

// 👥 Obține utilizatori (public sau protejat)
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