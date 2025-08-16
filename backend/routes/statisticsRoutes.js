const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');

const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');

    const tz = 'Europe/Amsterdam';
    const clampDays = (v, def = 7) =>
      Math.max(1, Math.min(parseInt(v ?? def, 10) || def, 90));

    const days = clampDays(req.query.days, 7);
    const categoryDays = clampDays(
      req.query.categoryDays ?? req.query.days,
      days
    );

    // Intervalele de date
    const getDateRange = (n) => {
      const now = new Date();
      const localMidnight = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      );
      const end = new Date(localMidnight);
      const start = new Date(end);
      start.setDate(end.getDate() - (n - 1));
      return { start, end };
    };

    const toIsoDate = (d) => d.toISOString().slice(0, 10);
    const dateFilter = (from, to) => [
      literal(
        `to_char(timezone('${tz}', "created_at"), 'YYYY-MM-DD') >= '${from}'`
      ),
      literal(
        `to_char(timezone('${tz}', "created_at"), 'YYYY-MM-DD') <= '${to}'`
      ),
    ];

    const { start, end } = getDateRange(days);
    const { start: catStart, end: catEnd } = getDateRange(categoryDays);

    const fromStr = toIsoDate(start);
    const toStr = toIsoDate(end);
    const catFromStr = toIsoDate(catStart);
    const catToStr = toIsoDate(catEnd);

    const validStatuses = [
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
    ];
    const statusFilter = { status: { [Op.in]: validStatuses } };

    // KPIs de bază
    const [totalOrders, totalRevenue, productsSold, activeClients] =
      await Promise.all([
        Order.count({ where: statusFilter }),
        Order.sum('total_price', { where: statusFilter }),
        OrderItem.sum('quantity', {
          include: [
            {
              model: Order,
              as: 'order', // alias EXACT din modelul OrderItem.belongsTo(Order)
              attributes: [],
              where: statusFilter,
            },
          ],
        }),
        User.count({ where: { role: 'client' } }),
      ]);

    // Vânzări pe zile
    const salesRaw = await Order.findAll({
      attributes: [
        [
          literal(
            `to_char(timezone('${tz}', "created_at"), 'YYYY-MM-DD')`
          ),
          'date',
        ],
        [fn('sum', col('total_price')), 'sales'],
      ],
      where: {
        ...statusFilter,
        [Op.and]: dateFilter(fromStr, toStr),
      },
      group: [literal(`1`)],
      order: [literal(`1`)],
    });

    const salesMap = new Map(
      salesRaw.map((r) => [
        r.get('date'),
        Number.parseFloat(r.get('sales')) || 0,
      ])
    );

    const filledSeries = Array.from({ length: days }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = toIsoDate(d);
      return { date: key, sales: salesMap.get(key) ?? 0 };
    });

    // Distribuție pe categorii
    const catRaw = await OrderItem.findAll({
      attributes: [
        [col('product.category'), 'name'], // folosim aliasul la col()
        [
          fn(
            'sum',
            literal('"OrderItem"."price" * "OrderItem"."quantity"')
          ),
          'value',
        ],
      ],
      include: [
        {
          model: Product,
          as: 'product', // alias EXACT din modelul OrderItem.belongsTo(Product)
          attributes: [],
        },
        {
          model: Order,
          as: 'order', // alias EXACT din modelul OrderItem.belongsTo(Order)
          attributes: [],
          where: {
            ...statusFilter,
            [Op.and]: [
              literal(
                `to_char(timezone('${tz}', "order"."created_at"), 'YYYY-MM-DD') >= '${catFromStr}'`
              ),
              literal(
                `to_char(timezone('${tz}', "order"."created_at"), 'YYYY-MM-DD') <= '${catToStr}'`
              ),
            ],
          },
        },
      ],
      group: [col('product.category')],
      order: [[col('product.category'), 'ASC']],
    });

    const categoryDistribution = catRaw.map((r) => ({
      name: r.get('name') ?? 'Neclasificat',
      value: Number.parseFloat(r.get('value')) || 0,
    }));

    res.json({
      totalOrders,
      totalRevenue: totalRevenue || 0,
      productsSold: productsSold || 0,
      activeClients,
      salesByDate: filledSeries,
      categoryDistribution,
      _meta: { days, categoryDays, tz },
    });
  } catch (err) {
    console.error('❌ Eroare la statistics:', err);
    res
      .status(500)
      .json({ error: 'Eroare la generarea statisticilor', details: err.message });
  }
});

module.exports = router;
