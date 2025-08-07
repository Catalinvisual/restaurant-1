require('dotenv').config(); // ✅ citește .env

const Order = require('./Order');
const Product = require('./Product');
const OrderItem = require('./OrderItem');
const User = require('./User');

// 🧩 Relații User ↔ Order
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// 🧾 Relații Order ↔ OrderItem
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// 📦 Relații Product ↔ OrderItem
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

// 🧠 Log informativ (doar în development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 [Associations] Relațiile Sequelize au fost definite cu succes.');
}