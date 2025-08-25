'use strict';

require('dotenv').config();

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const ENV = process.env.NODE_ENV || 'development';
console.log(`🚦 [Auth Routes] Mediul activ: ${ENV}`);

const verifyToken = require('../middlewares/verifyToken');

// 📝 Înregistrare
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Date lipsă în formular' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      if (email.toLowerCase().trim() === 'catalin@yahoo.com') {
        existingUser.isAdmin = true;
        existingUser.role = 'admin';
        await existingUser.save();

        return res.status(200).json({
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          isAdmin: existingUser.isAdmin,
          role: existingUser.role,
          message: 'Contul a fost actualizat ca admin'
        });
      }
      return res.status(409).json({ error: 'Email deja folosit' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      isAdmin: email.toLowerCase().trim() === 'catalin@yahoo.com',
      role: role || (email.toLowerCase().trim() === 'catalin@yahoo.com' ? 'admin' : 'client')
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
  console.log('🛠 Login request body:', req.body);

  try {
    const user = await User.findOne({ where: { email } });
    console.log('🔎 [login] User din DB:', user?.toJSON());

    if (!user) {
      console.warn('⚠️ Utilizator inexistent:', email);
      return res.status(401).json({ error: 'Credențiale incorecte' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.warn('⚠️ Parolă greșită pentru:', email);
      return res.status(401).json({ error: 'Credențiale incorecte' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role || (user.isAdmin ? 'admin' : 'client')
    };
    console.log('📦 [login] Payload pentru JWT:', payload);

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '365d' });

    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error('❌ Eroare la login:', err);
    res.status(500).json({ error: 'Eroare la autentificare', details: err.message });
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
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role || (user.isAdmin ? 'admin' : 'client')
    };
    console.log('♻️ [refresh] Payload nou pentru JWT:', newPayload);

    const newAccess = jwt.sign(newPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

    return res.json({ accessToken: newAccess });
  } catch (err) {
    console.error('❌ Eroare la refresh:', err);
    return res.status(403).json({ error: 'Token expirat sau invalid' });
  }
});

// 🚪 Logout
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

// 👥 Rută protejată
router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    return res.json(users);
  } catch (err) {
    console.error('❌ Eroare la obținerea utilizatorilor:', err);
    return res.status(500).json({ error: 'Eroare la obținerea utilizatorilor' });
  }
});

router.get('/me', verifyToken, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    isAdmin: req.user.isAdmin
  });
});

module.exports = router;
