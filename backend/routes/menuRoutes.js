require('dotenv').config(); // ✅ citește direct .env

const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

// ☁️ Cloudinary + Multer
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const ENV = process.env.NODE_ENV || 'development';
console.log(`🚦 [Menu Routes] Mediul activ: ${ENV}`);

// 🔐 Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// 📦 Multer + Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: ENV === 'production' ? 'restaurant-menu' : 'restaurant-menu-dev',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) cb(null, true);
    else cb(new Error('❌ Tip fișier invalid. Doar imagini sunt permise.'));
  }
});

// 🔽 Rute:

// 1️⃣ GET — toate produsele din meniu
router.get('/', async (req, res) => {
  try {
    const items = await Menu.findAll();
    res.status(200).json(items);
  } catch (error) {
    console.error('❌ Eroare la GET:', error);
    res.status(500).json({ error: 'Eroare la încărcarea meniului', details: error.message });
  }
});

// 2️⃣ POST — adaugă produs nou
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, isNew, isPromo } = req.body;

    if (
      !name || typeof name !== 'string' ||
      !price || isNaN(Number(price)) || Number(price) <= 0
    ) {
      return res.status(400).json({
        error: 'Câmpurile name (text) și price (numeric pozitiv) sunt obligatorii'
      });
    }

    const imageUrl = req.file?.path || req.file?.secure_url || null;

    const newItem = await Menu.create({
      name: name.trim(),
      price: parseFloat(price),
      description: description?.trim() || '',
      image: imageUrl,
      isNew: String(isNew) === 'true',
      isPromo: String(isPromo) === 'true'
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('❌ Eroare la POST:', error);
    res.status(500).json({ error: 'Eroare la adăugare produs', details: error.message });
  }
});

// 3️⃣ DELETE — șterge produs după ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await Menu.destroy({ where: { id: req.params.id } });
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit sau deja șters' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('❌ Eroare la DELETE:', error);
    res.status(500).json({ error: 'Eroare la ștergere produs', details: error.message });
  }
});

// 4️⃣ PUT — actualizează produs existent
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, isNew, isPromo } = req.body;
    const imageUrl = req.file?.path || req.file?.secure_url || req.body.image || null;

    if (
      !name || typeof name !== 'string' ||
      !price || isNaN(Number(price)) || Number(price) <= 0
    ) {
      return res.status(400).json({ error: 'name și price sunt obligatorii și valide' });
    }

    const [updatedCount, updatedRows] = await Menu.update({
      name: name.trim(),
      price: parseFloat(price),
      description: description?.trim() || '',
      image: imageUrl,
      isNew: String(isNew) === 'true',
      isPromo: String(isPromo) === 'true'
    }, {
      where: { id: req.params.id },
      returning: true
    });

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit' });
    }

    res.status(200).json(updatedRows[0]);
  } catch (error) {
    console.error('❌ Eroare la PUT:', error);
    res.status(500).json({ error: 'Eroare la actualizarea produsului', details: error.message });
  }
});

module.exports = router;