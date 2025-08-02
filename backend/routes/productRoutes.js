const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// 🔐 Middleware pentru verificarea tokenului
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

// 🖼️ Configurare multer cu nume real + extensie
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .jpg, .png etc.
    const base = path.basename(file.originalname, ext); // fără extensie
    const timestamp = Date.now();
    cb(null, `${base}-${timestamp}${ext}`);
  }
});

const upload = multer({ storage });

// 📦 Listare produse (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('❌ Eroare la listare produse:', error);
    res.status(500).json({ error: 'Eroare la încărcarea produselor' });
  }
});

// ➕ Adăugare produs cu fișier (protejată)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  const { name, description, price } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const newProduct = await Product.create({
      name,
      description,
      price: parseFloat(price),
      imageUrl
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('❌ Eroare la adăugare produs:', error);
    res.status(500).json({ error: 'Eroare la adăugare produs' });
  }
});

module.exports = router;