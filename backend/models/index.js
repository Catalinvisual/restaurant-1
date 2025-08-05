'use strict';

require('dotenv').config(); // ✅ citește implicit fișierul .env

const { Sequelize } = require('sequelize');
const ENV = process.env.NODE_ENV || 'development';

let sequelize;

if (process.env.DATABASE_URL && ENV === 'production') {
  // 🌍 Conectare producție (ex: Render)
  sequelize = new Sequelize(
    process.env.DATABASE_URL.replace(/^postgresql/, 'postgres'), // corectăm prefix dacă e nevoie
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
      port: Number(process.env.DB_PORT) || 5432, // port ca număr!
      logging: ENV === 'development'
    }
  );
}

// 🔗 Încarcă modelele Sequelize
const User = require('./User');
const Product = require('./Product');
const Menu = require('./Menu');
const Order = require('./Order');
const RefreshToken = require('./RefreshToken');

// 🧩 Relații suplimentare dacă le preferi centralizate (opțional)
// Ex: Order.belongsTo(User), etc. — deja definite în fișierele individuale

const db = {
  sequelize,
  Sequelize,
  User,
  Product,
  Menu,
  Order,
  RefreshToken
};

// 🛠️ Log doar în dezvoltare
if (ENV === 'development') {
  console.log('🔧 [Sequelize Init] Modelele au fost încărcate cu succes');
}

module.exports = db;
