require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const ENV = process.env.NODE_ENV || 'development';
console.log(`🚦 [Menu Routes] Mediul activ: ${ENV}`);

// 🔐 Cloudinary config dinamic
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

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
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('❌ Tip fișier invalid. Doar imagini sunt permise.'));
  }
});

// 📦 GET — toate produsele din meniu
router.get('/', async (req, res) => {
  try {
    const items = await Menu.findAll();
    res.status(200).json(items);
  } catch (error) {
    console.error('❌ Eroare la GET:', error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// ➕ POST — adaugă produs nou
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
      isNew: isNew === 'true',
      isPromo: isPromo === 'true'
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('❌ Eroare la POST:', error.stack);
    res.status(500).json({ error: 'Eroare internă server', details: error.message });
  }
});

// 🗑️ DELETE — șterge produs după ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await Menu.destroy({ where: { id: req.params.id } });
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit sau deja șters' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('❌ Eroare la DELETE:', error.stack);
    res.status(500).json({ error: 'Eroare la ștergere produs' });
  }
});

// ✏️ PUT — actualizează produs existent
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
      isNew: isNew === 'true',
      isPromo: isPromo === 'true'
    }, {
      where: { id: req.params.id },
      returning: true
    });

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit' });
    }

    res.status(200).json(updatedRows[0]);
  } catch (error) {
    console.error('❌ Eroare la PUT:', error.stack);
    res.status(500).json({ error: 'Eroare la actualizarea produsului' });
  }
});

module.exports = router;