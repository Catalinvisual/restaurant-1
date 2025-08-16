require('dotenv').config();

const express = require('express');
const router = express.Router();

const { Order, OrderItem, Product, User } = require('../models');
const verifyToken = require('../middleware/auth');
const verifyAdmin = require('../middleware/verifyAdmin');

const ENV = process.env.NODE_ENV || 'development';
console.log(`🚦 [Order Routes] Mediul activ: ${ENV}`);


// 🧾 Obține toate comenzile (admin)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'items', // alias din Order.hasMany(OrderItem)
          include: [
            {
              model: Product,
              as: 'product', // alias din OrderItem.belongsTo(Product)
              attributes: ['id', 'name', 'price', 'category', 'image']
            }
          ]
        },
        {
          model: User,
          as: 'user', // alias din Order.belongsTo(User)
          attributes: ['id', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('❌ Eroare la obținerea comenzilor:', error);
    res.status(500).json({ error: 'Eroare la server', details: error.message });
  }
});


// ✏️ Actualizare status comandă (admin)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status invalid' });
    }

    const order = await Order.findByPk(id, {
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
        { model: User, as: 'user', attributes: ['id', 'email', 'role'] }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Comanda nu a fost găsită' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('❌ Eroare la actualizarea statusului:', error);
    res.status(500).json({ error: 'Eroare la server', details: error.message });
  }
});


// 🛒 Plasare comandă (client)
router.post('/', verifyToken, async (req, res) => {
  const { customer_name, address, items } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole !== 'client') {
    return res.status(403).json({ error: 'Doar clienții pot plasa comenzi.' });
  }

  if (!customer_name || !address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Nume, adresă și produse sunt obligatorii.' });
  }

  for (const it of items) {
    if ((!it.product_id && !it.id) || !it.quantity || !it.price) {
      return res.status(400).json({ error: 'Date produs invalide.' });
    }
    if (Number(it.quantity) <= 0 || Number(it.price) <= 0) {
      return res.status(400).json({ error: 'Cantitate și preț trebuie să fie pozitive.' });
    }
  }

  try {
    const totalPrice = items.reduce(
      (acc, item) => acc + (Number(item.price) * Number(item.quantity)),
      0
    );

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

module.exports = router;
