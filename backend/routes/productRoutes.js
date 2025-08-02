const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// 🛡️ Middleware pentru validarea tokenului
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token lipsă' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalid' });
  }
};

// 🖼️ Configurare Multer pentru fișiere
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    cb(null, `${base}-${timestamp}${ext}`);
  }
});
const upload = multer({ storage });

// 📦 Listare produse (GET public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('❌ Eroare la listare produse:', error);
    res.status(500).json({ error: 'Eroare la încărcarea produselor' });
  }
});

// ➕ Adăugare produs cu imagine (POST protejat)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  const { name, description, price } = req.body;

  // ✅ Construire URL complet pentru imagine
  const baseUrl = process.env.BASE_URL || 'https://restaurant-app-backend.onrender.com';
  const imageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : '';

  try {
    const newProduct = await Product.create({
      name: name || 'Fără nume',
      description: description || '',
      price: parseFloat(price) || 0,
      image: imageUrl
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('❌ Eroare la adăugare produs:', error);
    res.status(500).json({ error: 'Eroare la adăugare produs' });
  }
});

module.exports = router;