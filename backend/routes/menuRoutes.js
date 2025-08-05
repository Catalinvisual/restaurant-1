require('dotenv').config();

const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

// ☁️ Cloudinary + Multer setup
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const ENV = process.env.NODE_ENV || 'development';
console.log(`🚦 [Menu Routes] Mediul activ: ${ENV}`);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: ENV === 'production' ? 'restaurant-menu' : 'restaurant-menu-dev',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) cb(null, true);
    else cb(new Error('❌ Tip fișier invalid. Doar imagini sunt permise.'));
  }
});


// 🔽 Rute:

// 1️⃣ GET — toate produsele
router.get('/', async (req, res) => {
  try {
    const items = await Menu.findAll();
    res.status(200).json(items);
  } catch (error) {
    console.error('❌ Eroare GET /api/menu:', error);
    res.status(500).json({ error: 'Eroare la încărcarea meniului', details: error.message });
  }
});

// 2️⃣ POST — adaugă produs
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, isNew, isPromo } = req.body;

    if (!name || !price || isNaN(price)) {
      return res.status(400).json({ error: 'Name și price valide sunt necesare' });
    }

    const imageUrl = req.file?.path || req.body.image || null;

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
    console.error('❌ Eroare POST /api/menu:', error);
    res.status(500).json({ error: 'Eroare la adăugare produs', details: error.message });
  }
});

// 3️⃣ DELETE — ștergere
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Menu.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit sau deja șters' });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error('❌ Eroare DELETE /api/menu/:id:', error);
    res.status(500).json({ error: 'Eroare la ștergere produs', details: error.message });
  }
});

// 4️⃣ PUT — actualizare
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, isNew, isPromo } = req.body;
    const imageUrl = req.file?.path || req.body.image || null;

    if (!name || !price || isNaN(price)) {
      return res.status(400).json({ error: 'Name și price valide sunt necesare' });
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
      return res.status(404).json({ error: 'Produsul nu a fost găsit pentru actualizare' });
    }

    res.status(200).json(updatedRows[0]);
  } catch (error) {
    console.error('❌ Eroare PUT /api/menu/:id:', error);
    res.status(500).json({ error: 'Eroare la actualizare produs', details: error.message });
  }
});

module.exports = router;