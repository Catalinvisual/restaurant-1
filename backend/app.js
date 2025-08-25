// ✅ Citește variabilele din .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./db'); // folosește config-ul Sequelize

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

// 🔐 CORS – acceptă doar local + producție Render
const allowedOrigins = [
  process.env.FRONTEND_URL_LOCAL || 'http://localhost:3000',
  process.env.FRONTEND_URL_PROD || 'https://restaurant-1-frontend.onrender.com'
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`❌ Origin not allowed by CORS: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// ✅ Montare rute API – backend răspunde doar la /api/*
app.use('/api/auth', authRoutes);       // include și GET /api/auth/me
app.use('/api/products', productRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/users', userRoutes);

// ❌ Eliminat codul de servire frontend/build → backend-ul NU mai servește React-ul

// 🔥 Middleware global pentru erori
app.use((err, req, res, next) => {
  console.error('❌ Eroare server:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Eroare internă de server' });
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
