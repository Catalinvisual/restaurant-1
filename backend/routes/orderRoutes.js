require('dotenv').config();

const express = require('express');
const router = express.Router();

const { Op } = require('sequelize'); // ✅ Import pentru filtrare
const { Order, OrderItem, Product, User } = require('../models');
const verifyToken = require('../middleware/verifyToken');

const verifyAdmin = require('../middleware/verifyAdmin');

const ENV = process.env.NODE_ENV || 'development';
console.log(`🚦 [Order Routes] Mediul activ: ${ENV}`);


// 🧾 Obține comenzile (cu filtrare opțională după dată)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  const { date } = req.query;
  const whereClause = {};

  if (date) {
    try {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      whereClause.created_at = {
        [Op.between]: [start, end]
      };
    } catch (err) {
      return res.status(400).json({ error: 'Format dată invalid. Folosește YYYY-MM-DD.' });
    }
  }

  try {
    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'category', 'image']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role']
        }
      ],
      distinct: true,
      order: [['created_at', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('❌ Eroare la obținerea comenzilor:', error);
    res.status(500).json({ error: 'Eroare la server', details: error.message });
  }
});


// 🧹 Șterge comenzile invalide (fără status sau total_price)
router.delete('/debug/invalid-orders', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deleted = await Order.destroy({
      where: {
        [Op.or]: [
          { status: null },
          { total_price: null }
        ]
      }
    });

    res.json({ message: `🧹 ${deleted} comenzi șterse.` });
  } catch (error) {
    console.error('❌ Eroare la ștergerea comenzilor invalide:', error);
    res.status(500).json({ error: 'Eroare la server', details: error.message });
  }
});


// 🛒 Plasare comandă (client + admin)
router.post('/', verifyToken, async (req, res) => {
  const { customer_name, address, items } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  // ✅ Acceptă atât client cât și admin
  if (!['client', 'admin'].includes(userRole)) {
    return res.status(403).json({ error: 'Doar clienții și adminii pot plasa comenzi.' });
  }

  if (!customer_name || !address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Nume, adresă și produse sunt obligatorii.' });
  }

  // ✅ Validare produse
  for (const it of items) {
    const price = Number(it.price);
    const quantity = Number(it.quantity);
    if ((!it.product_id && !it.id) || isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
      return res.status(400).json({ error: 'Date produs invalide.' });
    }
  }

  try {
    // 🔍 Log ce vine de la frontend
    console.log('📦 Items primite la backend:', items);

    const totalPrice = items.reduce((acc, item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);
      console.log(`→ Produs ${item.product_id || item.id}: ${price} x ${quantity} = ${price * quantity}`);
      return acc + (price * quantity);
    }, 0);

    console.log('💰 Total calculat:', totalPrice);

    const newOrder = await Order.create({
      user_id: userId,
      customer_name: customer_name.trim(),
      address: address.trim(),
      total_price: totalPrice,
      status: 'pending'
    });

    const orderItemsData = items.map(item => ({
      order_id: newOrder.id,
      product_id: item.product_id || item.id,
      quantity: Number(item.quantity),
      price: Number(item.price)
    }));

    await OrderItem.bulkCreate(orderItemsData);

    return res.status(201).json({
      message: '✅ Comanda înregistrată cu succes.',
      order: newOrder,
      items: orderItemsData
    });

  } catch (error) {
    console.error('❌ Eroare la plasare comandă:', error);
    return res.status(500).json({ error: 'Eroare la server', details: error.message });
  }
});
// 📦 Comenzile utilizatorului autentificat
router.get('/user', verifyToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'category', 'image', 'description']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('❌ Eroare la preluarea comenzilor utilizatorului:', error);
    res.status(500).json({ error: 'Eroare la server', details: error.message });
  }
});


module.exports = router;
