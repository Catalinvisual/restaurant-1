const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./db');

// Modele
require('./models/User');
require('./models/Product');
require('./models/Menu'); // 🔄 modelele doar se înregistrează aici

// Rute
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const menuRoutes = require('./routes/menuRoutes');

const app = express();

// 🔀 CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://restaurant-1-frontend.onrender.com',
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
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Servire fișiere statice
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Rute API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menu', menuRoutes);

// ✅ Fallback pentru erori
app.use((err, req, res, next) => {
  console.error('❌ Eroare server:', err.message);
  res.status(500).json({ error: 'Eroare internă de server' });
});

// ✅ Start server și sincronizare
const PORT = process.env.PORT || 3001;
sequelize
  .sync() // 👉 fără `force: true` ca să nu pierzi datele
  .then(() => {
    console.log('✅ Baza de date sincronizată');
    app.listen(PORT, () => {
      console.log(`🚀 Server pornit pe portul ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Eroare la sincronizare DB:', error);
  });