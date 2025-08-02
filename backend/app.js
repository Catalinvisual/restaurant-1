const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./db');

// Modele
const User = require('./models/User');
const Product = require('./models/Product');
const Menu = require('./models/Menu'); // ✅ Adăugăm modelul Menu

// Rute
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const menuRoutes = require('./routes/menuRoutes'); // ✅ Ruta nouă pentru meniu

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Servire fișiere imagine locale
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Rute API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menu', menuRoutes); // ✅ Activăm ruta de meniu

// ✅ Sincronizare DB + compatibilitate Render
const PORT = process.env.PORT || 3001; // 🔁 Modificare port
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database sincronizată');
    app.listen(PORT, () => {
      console.log(`🚀 Server pornit pe portul ${PORT}`);
    });
  })
  .catch(error => {
    console.error('❌ Eroare sincronizare DB:', error);
  });