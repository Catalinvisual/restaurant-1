const { Order, OrderItem } = require('../models');

// Creează o comandă nouă împreună cu produsele din ea
exports.createOrder = async (req, res) => {
  const { user_id, address, items } = req.body;

  if (!user_id || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Date comandă invalide' });
  }

  try {
    // 1️⃣ Creează comanda inițială
    const order = await Order.create({
      user_id,
      address,
      status: 'pending'
    });

    // 2️⃣ Creează produsele din comandă
    const orderItems = await Promise.all(
      items.map(item => OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }))
    );

    // 3️⃣ Calculează totalul
    const total = orderItems.reduce((acc, item) =>
      acc + (Number(item.price) * item.quantity), 0
    );

    // 4️⃣ Actualizează comanda cu totalul
    await order.update({ total_price: total });

    // 5️⃣ Refetch complet cu relații incluse
    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    // 6️⃣ Serializare și răspuns complet
    const plainOrder = fullOrder.get({ plain: true });

    res.status(201).json({
      message: 'Comandă creată cu succes',
      order: {
        ...plainOrder,
        created_at: fullOrder.createdAt, // ✅ format ISO valid
        total_price: parseFloat(fullOrder.total_price),
        items: plainOrder.items
      }
    });

  } catch (err) {
    console.error('❌ Eroare la crearea comenzii:', err);
    res.status(500).json({ error: 'Eroare internă la crearea comenzii' });
  }
};
