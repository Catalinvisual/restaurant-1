require('dotenv').config(); // ✅ citește .env

const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./db');

const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3001;

console.log(`🚦 Mediul activ: ${ENV}`);
const BASE_URL =
  ENV === 'production'
    ? process.env.BASE_URL
    : `http://localhost:${PORT}`;
console.log(`🌐 BASE_URL: ${BASE_URL}`);

// 🔁 Modele Sequelize
require('./models/User');
require('./models/Product');
require('./models/Menu');
require('./models/Order');
require('./models/OrderItem'); // ✅ relație esențială

// 📦 Rute
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

// 🚀 Express app
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

// ✅ Montare rute
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/users', require('./routes/userRoutes'));

// 🧱 Servire frontend în producție
if (ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));
app.get('/:splat(*)', (req, res) => {
  return res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});


}

// 🔥 Middleware de erori (sigur contra răspunsurilor duble)
app.use((err, req, res, next) => {
  console.error('❌ Eroare server:', err);

  if (res.headersSent) {
    // Dacă deja am trimis ceva, lăsăm Express să gestioneze
    return next(err);
  }

  return res.status(500).json({ error: 'Eroare internă de server' });
});

// 🧠 Pornire server + sincronizare DB
sequelize.authenticate()
  .then(async () => {
    console.log('✅ Conexiune DB reușită');

    if (ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('📦 Sync DB cu alter activat (local)');
    } else {
      await sequelize.sync();
      console.log('📦 Sync DB simplu (producție)');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server pornit pe ${BASE_URL}`);
    });
  })
  .catch((error) => {
    console.error('❌ Eroare la conectare/sync DB:', error);
  });
