'use strict';

require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const Sequelize = require('sequelize');
const ENV = process.env.NODE_ENV || 'development';

let sequelize;

if (process.env.DATABASE_URL && ENV === 'production') {
  // 🌍 Conectare producție (ex: Render)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    },
    logging: false
  });
} else {
  // 💻 Conectare locală
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'postgres',
      port: process.env.DB_PORT || 5432,
      logging: ENV === 'development'
    }
  );
}

// 🔗 Încarcă modelele statice
const User = require('./User');
const Product = require('./Product');
const Menu = require('./Menu');
const Order = require('./Order');
const RefreshToken = require('./RefreshToken');

// 🔄 Poți adăuga relații suplimentare aici dacă vrei
// Exemplu: deja definite în `Order.js`

const db = {
  sequelize,
  Sequelize,
  User,
  Product,
  Menu,
  Order,
  RefreshToken
};

// 🛠️ Log în mediu de dezvoltare
if (ENV === 'development') {
  console.log('🔧 Modelele Sequelize au fost încărcate cu succes.');
}

module.exports = db;
