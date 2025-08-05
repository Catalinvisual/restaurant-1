require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Product = sequelize.define(
  'Product',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0.01 // ⛑️ preț minim valid
      }
    }
  },
  {
    tableName: 'products',     // ⛑️ corespunde tabelului din DB
    freezeTableName: true,     // 🚫 evită pluralizarea automată
    timestamps: true           // ✅ generează createdAt & updatedAt
  }
);

// 📦 Log doar în mediul local
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Modelul Product a fost încărcat.');
}

module.exports = Product;