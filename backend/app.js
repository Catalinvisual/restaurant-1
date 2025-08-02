const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./db');

// Modele
const User = require('./models/User');
const Product = require('./models/Product');
const Menu = require('./models/Menu');

// Rute
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const menuRoutes = require('./routes/menuRoutes');

const app = express();

// 🔀 Originuri permise: localhost și domeniul Render
const allowedOrigins = [
  'http://localhost:3000',
  'https://restaurant-1-frontend.onrender.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // ✅ Permis
    } else {
      callback(new Error('❌ Origin not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Servire fișiere imagine locale
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Rute API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menu', menuRoutes);

// ✅ Sincronizare DB + compatibilitate Render
const PORT = process.env.PORT || 3001;
sequelize.sync({ force: true })
  .then(() => {
    console.log('✅ Database sincronizată');
    app.listen(PORT, () => {
      console.log(`🚀 Server pornit pe portul ${PORT}`);
    });
  })
  .catch(error => {
    console.error('❌ Eroare sincronizare DB:', error);
  });