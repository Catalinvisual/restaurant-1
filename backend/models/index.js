'use strict';

require('dotenv').config(); // ✅ citește fișierul .env

const { Sequelize } = require('sequelize');
const ENV = process.env.NODE_ENV || 'development';

let sequelize;

// 🌍 Conectare producție
if (process.env.DATABASE_URL && ENV === 'production') {
  sequelize = new Sequelize(
    process.env.DATABASE_URL.replace(/^postgresql/, 'postgres'),
    {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
      },
      logging: false
    }
  );
} else {
  // 💻 Conectare locală
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'postgres',
      port: Number(process.env.DB_PORT) || 5432,
      logging: ENV === 'development'
    }
  );
}

// 🔗 Încarcă modelele Sequelize
const User = require('./User');
const Product = require('./Product');
const Menu = require('./Menu');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const RefreshToken = require('./RefreshToken');

// 🧩 Setare relații globale
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

// ⚙️ Sincronizează schema DB
sequelize.sync({ alter: true })
  .then(() => {
    console.log(`✅ [Sequelize Sync] Schema DB actualizată (${ENV})`);
  })
  .catch((err) => {
    console.error(`❌ [Sequelize Sync] Eroare la sync (${ENV}):`, err);
  });

// 🎯 Export obiect global
const db = {
  sequelize,
  Sequelize,
  User,
  Product,
  Menu,
  Order,
  OrderItem,
  RefreshToken
};

if (ENV === 'development') {
  console.log('🔧 [Sequelize Init] Modelele au fost încărcate cu succes');
}

module.exports = db;