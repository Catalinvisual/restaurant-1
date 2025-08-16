const express = require('express');
const router = express.Router();
const { User, Order, OrderItem, Product } = require('../models');
const verifyToken = require('../middleware/auth');
const verifyAdmin = require('../middleware/verifyAdmin');

router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const clients = await User.findAll({
      where: { role: 'client' },
      include: [
        {
          model: Order,
          as: 'orders', // alias corect
          include: [
            {
              model: OrderItem,
              as: 'items', // alias corect
              include: [
                { model: Product, as: 'product' } // alias corect
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const data = clients.map(c => {
      const sortedOrders = [...c.orders].sort((a, b) => b.createdAt - a.createdAt);
      const lastOrder = sortedOrders[0] || null;

      return {
        id: c.id,
        email: c.email,
        createdAt: c.createdAt,
        orderCount: c.orders.length,
        totalSpent: c.orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0),
        lastOrder: lastOrder
          ? {
              status: lastOrder.status,
              createdAt: lastOrder.createdAt
            }
          : null
      };
    });

    res.json(data);
  } catch (err) {
    console.error('❌ Eroare la preluarea clienților:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
