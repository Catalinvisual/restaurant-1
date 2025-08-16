'use strict';

require('dotenv').config();

const { Sequelize } = require('sequelize');
const ENV = process.env.NODE_ENV || 'development';

let sequelize;

// 🔌 Conexiunea DB
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

// 📦 Import modele
const User = require('./User');
const Product = require('./Product');
const Menu = require('./Menu');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const RefreshToken = require('./RefreshToken');

// 🔗 Relații globale cu aliasuri consistente
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

Order.belongsToMany(Product, {
  through: OrderItem,
  foreignKey: 'order_id',
  otherKey: 'product_id',
  as: 'orderedProducts'
});

Product.belongsToMany(Order, {
  through: OrderItem,
  foreignKey: 'product_id',
  otherKey: 'order_id',
  as: 'ordersWithProduct'
});

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 📡 Export instanța + modelele
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
  console.log('🔧 [Sequelize Init] Modelele + relațiile au fost încărcate cu succes');
}

module.exports = db;
