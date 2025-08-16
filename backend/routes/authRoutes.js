'use strict';

require('dotenv').config(); // 🔐 Încarcă .env

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const ENV = process.env.NODE_ENV || 'development';
console.log(`🚦 [Auth Routes] Mediul activ: ${ENV}`);

// Middleware verificare token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token lipsă' });

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Format token invalid' });
  }

  const token = parts[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      const msg = err.name === 'TokenExpiredError'
        ? 'Token expirat'
        : 'Token invalid sau corupt';
      return res.status(403).json({ error: msg });
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

// 📝 Înregistrare
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Date lipsă în formular' });
  }
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email invalid' });
    }
    if (await User.findOne({ where: { email } })) {
      return res.status(409).json({ error: 'Email deja folosit' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      isAdmin: email === 'catalin@yahoo.com',
      role: role || (email === 'catalin@yahoo.com' ? 'admin' : 'client')
    });
    return res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      role: newUser.role
    });
  } catch (err) {
    console.error('❌ Eroare la înregistrare:', err);
    return res.status(500).json({ error: 'Eroare la înregistrare' });
  }
});

// 🔑 Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credențiale incorecte' });
    }

    const payload = {
      id: user.id,
      isAdmin: user.isAdmin,
      role: user.role || (user.isAdmin ? 'admin' : 'client')
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '365d' });

    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    return res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error('❌ Eroare la login:', err);
    return res.status(500).json({ error: 'Eroare la autentificare' });
  }
});

// ♻️ Refresh token
router.post('/refresh', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: 'Token lipsă' });
  try {
    const stored = await RefreshToken.findOne({ where: { token } });
    if (!stored) return res.status(403).json({ error: 'Token invalid sau expirat' });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(payload.userId);
    if (!user) return res.status(403).json({ error: 'Utilizator inexistent' });

    const newPayload = {
      id: user.id,
      isAdmin: user.isAdmin,
      role: user.role || (user.isAdmin ? 'admin' : 'client')
    };

    const newAccess = jwt.sign(newPayload, process.env.JWT_SECRET, { expiresIn: '15m' });
    return res.json({ accessToken: newAccess });
  } catch (err) {
    console.error('❌ Eroare la refresh:', err);
    return res.status(403).json({ error: 'Token expirat sau invalid' });
  }
});

// 🚪 Logout — protejat cu verifyToken
router.post('/logout', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    await RefreshToken.destroy({ where: { userId } });
    return res.status(204).send();
  } catch (err) {
    console.error('❌ Eroare la logout:', err);
    return res.status(500).json({ error: 'Eroare la logout' });
  }
});

// 👥 Rută protejată — exemplu
router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    return res.json(users);
  } catch (err) {
    console.error('❌ Eroare la obținerea utilizatorilor:', err);
    return res.status(500).json({ error: 'Eroare la obținerea utilizatorilor' });
  }
});

module.exports = router;
