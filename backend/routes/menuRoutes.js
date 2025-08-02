const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu'); // modelul Menu trebuie să fie definit

// ✅ GET /api/menu — lista meniului
router.get('/', async (req, res) => {
  try {
    const items = await Menu.findAll(); // Obține toate produsele
    res.status(200).json(items);
  } catch (error) {
    console.error('❌ Eroare la obținerea meniului:', error);
    res.status(500).json({ error: 'Eroare server' });
  }
});

// ✅ POST /api/menu — adaugă un produs (opțional)
router.post('/', async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const newItem = await Menu.create({ name, price, description });
    res.status(201).json(newItem);
  } catch (error) {
    console.error('❌ Eroare la adăugare produs:', error);
    res.status(500).json({ error: 'Eroare server' });
  }
});

module.exports = router;