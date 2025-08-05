require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const verifyToken = require('../middleware/auth');

// 🔍 Detectăm mediul activ
const ENV = process.env.NODE_ENV || 'development';
console.log(`🚦 [Order Routes] Mediul activ: ${ENV}`);

// 📦 Validare simplă pentru input
const validateOrderInput = (req, res, next) => {
  const { userId, productId, quantity, address } = req.body;
  if (!userId || !productId || !quantity || !address) {
    return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii.' });
  }
  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'Cantitate invalidă.' });
  }
  next();
};

// 🛒 Plasare comandă (POST protejat)
router.post('/', verifyToken, validateOrderInput, async (req, res) => {
  const { userId, productId, quantity, address } = req.body;
  try {
    const newOrder = await Order.create({ userId, productId, quantity, address });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('❌ Eroare la plasare comandă:', error);
    res.status(500).json({ error: 'Eroare la server', details: error.message });
  }
});

// 📋 Comenzile unui utilizator (GET protejat)
router.get('/user/:id', verifyToken, async (req, res) => {
  const userId = req.params.id;

  // ✅ Protejăm accesul la comenzi doar pentru utilizatorul autentificat
  if (String(req.user.id) !== String(userId)) {
    return res.status(403).json({ error: 'Acces interzis la comenzi altui utilizator.' });
  }

  try {
    const orders = await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('❌ Eroare la listare comenzi:', error);
    res.status(500).json({ error: 'Eroare la server', details: error.message });
  }
});

module.exports = router;