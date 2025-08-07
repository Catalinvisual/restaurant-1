require('dotenv').config(); // ✅ citește .env

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product'); // ✅ importă modelul de produs
const verifyToken = require('../middleware/auth');

// ✅ definește relația dacă nu era definită
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

const ENV = process.env.NODE_ENV || 'development';
console.log(`🚦 [Order Routes] Mediul activ: ${ENV}`);

// 🛒 Plasare comandă — coș multiplu
router.post('/', verifyToken, async (req, res) => {
  const { address, items } = req.body;
  const userId = req.user.id;

  if (!address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Adresă și produse sunt obligatorii.' });
  }

  try {
    // ✅ Creează comanda
    const newOrder = await Order.create({
      user_id: userId,
      address: address.trim()
    });

    // 🧾 Creează OrderItem pentru fiecare produs
    const orderItemsData = items.map(item => ({
      order_id: newOrder.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    await OrderItem.bulkCreate(orderItemsData);

    res.status(201).json({
      message: '✅ Comanda înregistrată cu succes.',
      order: newOrder,
      items: orderItemsData
    });
  } catch (error) {
    console.error('❌ Eroare la plasare comandă:', error);
    res.status(500).json({ error: 'Eroare la server', details: error.message });
  }
});

// 📋 Comenzile unui utilizator
router.get('/user', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: 'OrderItems',
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'description', 'image', 'price'] // 🔍 detalii produs
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('❌ Eroare la listare comenzi:', error);
    res.status(500).json({ error: 'Eroare la server', details: error.message });
  }
});

module.exports = router;