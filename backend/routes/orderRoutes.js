const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Plasare comandă
router.post('/', async (req, res) => {
  const { userId, productId, quantity, address } = req.body;
  try {
    const newOrder = await Order.create({ userId, productId, quantity, address });
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la plasarea comenzii' });
  }
});

// Comenzile unui utilizator
router.get('/user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const orders = await Order.findAll({ where: { userId } });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la listarea comenzilor' });
  }
});

module.exports = router;