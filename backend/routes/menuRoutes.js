const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'https://restaurant-app-backend.onrender.com';

// 📁 Asigură-te că folderul uploads există
const fs = require('fs');
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 🖼️ Configurare Multer pentru fișiere imagine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const uniqueName = `${name}-${timestamp}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('❌ Tip fișier invalid. Doar imagini sunt permise.'));
    }
  }
});

// 📦 Ruta GET — obține toate produsele din meniu
router.get('/', async (req, res) => {
  try {
    const items = await Menu.findAll();
    res.status(200).json(items);
  } catch (error) {
    console.error('❌ Eroare la obținerea meniului:', error.message);
    res.status(500).json({ error: 'Eroare server la GET /api/menu', details: error.message });
  }
});

// ➕ Ruta POST — adaugă un nou produs cu imagine
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description } = req.body;

    // ✅ Validare de bază
    if (!name || typeof name !== 'string' || !price || isNaN(price)) {
      return res.status(400).json({ error: 'name (text) și price (numeric) sunt obligatorii' });
    }

    // 🔗 Construiește URL complet pentru imagine
    const imageUrl = req.file
      ? `${BASE_URL}/uploads/${req.file.filename}`
      : `${BASE_URL}/uploads/default.jpg`; // fallback opțional

    const newItem = await Menu.create({
      name,
      price: parseFloat(price),
      description: description || '',
      image: imageUrl
    });

    console.log('✅ Produs nou salvat:', newItem.toJSON());
    res.status(201).json(newItem);
  } catch (error) {
    console.error('❌ Eroare la adăugare produs:', error.message);
    res.status(500).json({ error: 'Eroare server la POST /api/menu', details: error.message });
  }
});

module.exports = router;