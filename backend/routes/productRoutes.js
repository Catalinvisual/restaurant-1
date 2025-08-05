require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// ☁️ Cloudinary + Multer
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 🔍 Detectare mediu
const ENV = process.env.NODE_ENV || 'development';
console.log(`🚦 Mediul activ: ${ENV}`);

// 🔐 Config Cloudinary (asigură-te că variabilele sunt în .env corespunzător)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: ENV === 'production' ? 'products' : 'products-dev',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const upload = multer({ storage });

// 🛡️ Middleware JWT
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

// 📦 GET produse (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('❌ Eroare la listare produse:', error);
    res.status(500).json({ error: 'Eroare la încărcarea produselor' });
  }
});

// ➕ POST produs cu imagine (protejată)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  const { name, description, price } = req.body;
  const imageUrl = req.file?.path || null;

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