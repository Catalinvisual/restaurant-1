require('dotenv').config(); // ✅ folosește implicit fișierul .env


const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ENV = process.env.NODE_ENV || 'development';

const Product = sequelize.define(
  'Product',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100] // 📏 nume între 2-100 caractere
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'image_url' // 🛠️ mapare clară către DB
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0.01
      }
    }
  },
  {
    tableName: 'products',
    freezeTableName: true,
    timestamps: true
  }
);

// 📦 Log doar în mediul local
if (ENV === 'development') {
  console.log('🔧 [Product Model] încărcat cu succes');
}

module.exports = Product;