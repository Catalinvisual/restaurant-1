const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Înregistrare
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = email === 'catalin@yahoo.com'; // dacă Catalin se înregistrează ⇒ admin

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin // 👈 Trebuie să fie acest nume, NU "is_admin"
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

module.exports = router;