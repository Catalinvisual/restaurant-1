require('dotenv').config(); // citește direct .env (singurul fișier pe care îl ai)

const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./db');

// 🔍 Detectăm mediul curent
const ENV = process.env.NODE_ENV || 'development';
console.log(`🚦 Mediul activ: ${ENV}`);

// 🌐 URL-ul aplicației
const BASE_URL =
  ENV === 'production'
    ? process.env.BASE_URL
    : `http://localhost:${process.env.PORT || 3001}`;
console.log(`🌐 BASE_URL: ${BASE_URL}`);

// Modele Sequelize
require('./models/User');
require('./models/Product');
require('./models/Menu');

// Rute
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const menuRoutes = require('./routes/menuRoutes');

// Express app
const app = express();

// 🔐 CORS dinamic
const allowedOrigins = [
  process.env.FRONTEND_URL_LOCAL || 'http://localhost:3000',
  process.env.FRONTEND_URL_PROD || 'https://restaurant-1-frontend.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Origin not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Rute API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menu', menuRoutes);

// ✅ Tratamentul erorilor
app.use((err, req, res, next) => {
  console.error('❌ Eroare server:', err.message);
  res.status(500).json({ error: 'Eroare internă de server' });
});

// ✅ Pornirea serverului + sincronizare DB
const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(async () => {
    console.log('✅ Conexiune DB reușită');

    // 🔁 Sincronizare DB: în local facem alter, în producție doar sync
    if (ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('📦 Sync DB cu alter activat (local)');
    } else {
      await sequelize.sync();
      console.log('📦 Sync DB simplu (Render/live)');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server pornit pe portul ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Eroare la conectare/sync:');
    console.error(error); // log complet
  });