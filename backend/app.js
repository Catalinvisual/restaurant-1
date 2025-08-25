'use strict';

// ✅ Citește variabilele din .env (ale backend-ului)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./db');

const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3001;

console.log(`🚦 Mediul activ: ${ENV}`);

const BASE_URL = ENV === 'production'
  ? process.env.BASE_URL
  : `http://localhost:${PORT}`;
console.log(`🌐 BASE_URL: ${BASE_URL}`);

// 🔁 Modele Sequelize
require('./models/User');
require('./models/Product');
require('./models/Menu');
require('./models/Order');
require('./models/OrderItem');

// 📦 Rute
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const userRoutes = require('./routes/userRoutes');

// 🚀 Inițializare Express
const app = express();

// 🔐 CORS – acceptă doar origini permise, cu fallback pentru local

const allowedOrigins = [
  'http://localhost:3000',           // frontend (React/Next dev)
  process.env.FRONTEND_URL_DEV,      // setat în .env pentru dev
  process.env.FRONTEND_URL_PROD      // setat în .env pentru producție
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true); // Postman / curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`❌ Origin not allowed by CORS: ${origin}`));
  },
  credentials: true
}));



app.use(express.json());

// ✅ Montare rute API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/users', userRoutes);

// 🔥 Middleware global pentru erori (unificat)
app.use((err, req, res, next) => {
  console.error('❌ Eroare server:', err); // log complet
  if (res.headersSent) return next(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Eroare internă de server'
  });
});

// 🧠 Pornire server + sincronizare DB
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexiune DB reușită');

    await sequelize.sync({ alter: true });
    console.log(`📦 DB sincronizată cu \`alter: true\` (${ENV})`);

    app.listen(PORT, () => {
      console.log(`🚀 Server pornit pe ${BASE_URL}`);
    });
  } catch (error) {
    console.error('❌ Eroare la conectare/sync DB:', error);
  }
})();
