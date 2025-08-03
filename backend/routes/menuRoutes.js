const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
require('dotenv').config();

// ☁️ Cloudinary config
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// 🖼️ Storage Multer cu Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'restaurant-menu',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

    if (!name || typeof name !== 'string' || !price || isNaN(price)) {
      return res.status(400).json({ error: 'name (text) și price (numeric) sunt obligatorii' });
    }

    const imageUrl = req.file?.path || null; // 🔗 Link direct din Cloudinary

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