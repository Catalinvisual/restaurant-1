const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

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

// ➕ POST /api/menu — adaugă un produs nou
router.post('/', async (req, res) => {
  try {
    const { name, price, description, image } = req.body;

    // ✅ Validare simplă
    if (!name || !price) {
      return res.status(400).json({ error: 'name și price sunt obligatorii' });
    }

    const newItem = await Menu.create({ name, price, description, image });
    console.log('✅ Produs nou adăugat:', newItem.toJSON());

    res.status(201).json(newItem);
  } catch (error) {
    console.error('❌ Eroare la adăugare produs:', error.message);
    res.status(500).json({ error: 'Eroare server la POST /api/menu' });
  }
});

module.exports = router;