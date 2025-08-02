const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Product = sequelize.define('Product', {
  name:        { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  imageUrl:    { type: DataTypes.STRING },
  price:       { type: DataTypes.FLOAT, allowNull: false }
}, {
  tableName: 'products',       // ⛑️ exact ca în baza de date
  freezeTableName: true,       // 🚫 evită pluralizare automată → "Products"
  timestamps: true             // ✅ generează createdAt, updatedAt automat
});

module.exports = Product;