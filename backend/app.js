const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./db');

// Modele
const User = require('./models/User');
const Product = require('./models/Product'); // ✅ adăugat pentru acces modelul Product

// Rute
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Servire fișiere imagine locale
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Rute API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);


// ✅ Sincronizare baza de date și pornirea serverului
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database sincronizată');
    app.listen(3001, () => {
      console.log('🚀 Server pornit pe http://localhost:3001');
    });
  })
  .catch(error => {
    console.error('❌ Eroare sincronizare DB:', error);
  });