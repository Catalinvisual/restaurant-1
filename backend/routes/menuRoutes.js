require('dotenv').config();

const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

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

const handleUploadError = (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Imaginea este prea mare. Maxim 5MB permis.' });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// 🔧 Helpers
const toBool = (value) => String(value).toLowerCase() === 'true';

const validateProduct = ({ name, price, category }) => {
  if (!name || !price || isNaN(price)) {
    return 'Name și price valide sunt necesare';
  }
  if (!['mancare', 'bautura'].includes(category)) {
    return 'Categoria trebuie să fie "mancare" sau "bautura"';
  }
  return null;
};

// 🔽 Rute

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const items = await Menu.findAll({ where: category ? { category } : {} });
    res.status(200).json(items);
  } catch (error) {
    console.error('❌ Eroare GET /api/menu:', error);
    res.status(500).json({ error: 'Eroare la încărcarea meniului', details: error.message });
  }
});

router.post('/', handleUploadError, async (req, res) => {
  try {
    const { name, price, description, isNew, isPromo, category } = req.body;
    const validationError = validateProduct({ name, price, category });
    if (validationError) return res.status(400).json({ error: validationError });

    const imageUrl = req.file?.path || req.body.image || null;

    const newItem = await Menu.create({
      name: name.trim(),
      price: parseFloat(price),
      description: description?.trim() || '',
      image: imageUrl,
      isNew: toBool(isNew),
      isPromo: toBool(isPromo),
      category
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('❌ Eroare POST /api/menu:', error);
    res.status(500).json({ error: 'Eroare la adăugare produs', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Menu.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Produsul nu a fost găsit sau deja șters' });
    res.sendStatus(204);
  } catch (error) {
    console.error('❌ Eroare DELETE /api/menu/:id:', error);
    res.status(500).json({ error: 'Eroare la ștergere produs', details: error.message });
  }
});

router.put('/:id', handleUploadError, async (req, res) => {
  try {
    const { name, price, description, isNew, isPromo, category } = req.body;
    const validationError = validateProduct({ name, price, category });
    if (validationError) return res.status(400).json({ error: validationError });

    const imageUrl = req.file?.path || req.body.image || null;

    const [updatedCount, updatedRows] = await Menu.update({
      name: name.trim(),
      price: parseFloat(price),
      description: description?.trim() || '',
      image: imageUrl,
      isNew: toBool(isNew),
      isPromo: toBool(isPromo),
      category
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
