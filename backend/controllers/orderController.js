const { Order, OrderItem } = require('../models');

// Creează o comandă nouă împreună cu produsele din ea
exports.createOrder = async (req, res) => {
  const { user_id, address, items } = req.body; 
  // items: [{ product_id, quantity, price }, ...]

  if (!user_id || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Date comandă invalide' });
  }

  try {
    // 1️⃣ Creează comanda fără total (total_price = 0 implicit)
    const order = await Order.create({
      user_id,
      address,
      status: 'pending'
    });

    // 2️⃣ Creează toate OrderItems
    const orderItems = await Promise.all(
      items.map(item => OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }))
    );

    // 3️⃣ Calculează totalul comenzii
    const total = orderItems.reduce((acc, item) => 
      acc + (Number(item.price) * item.quantity), 0
    );

    // 4️⃣ Actualizează comanda cu totalul calculat
    await order.update({ total_price: total });

    // 5️⃣ Trimite răspuns complet către client
    res.status(201).json({
      message: 'Comandă creată cu succes',
      order: {
        ...order.toJSON(),
        total_price: total,
        items: orderItems
      }
    });

  } catch (err) {
    console.error('❌ Eroare la crearea comenzii:', err);
    res.status(500).json({ error: 'Eroare internă la crearea comenzii' });
  }
};
