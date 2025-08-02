const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const multer = require('multer');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// 📦 Configurare Multer pentru upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 🔎 GET /api/menu — obține meniul
router.get('/', async (req, res) => {
  try {
    const items = await Menu.findAll();
    res.status(200).json(items);
  } catch (error) {
    console.error('❌ Eroare la obținerea meniului:', error.message);
    res.status(500).json({ error: 'Eroare server la GET /api/menu' });
  }
});

// ➕ POST /api/menu — adaugă produs nou cu imagine
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'name și price sunt obligatorii' });
    }

    // 🔗 Construiește link imagine complet (HTTPS)
    const imageUrl = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : null;

    const newItem = await Menu.create({
      name,
      price,
      description,
      image: imageUrl
    });

    console.log('✅ Produs nou salvat:', newItem.toJSON());
    res.status(201).json(newItem);
  } catch (error) {
    console.error('❌ Eroare la adăugare produs:', error.message);
    res.status(500).json({ error: 'Eroare server la POST /api/menu' });
  }
});

module.exports = router;