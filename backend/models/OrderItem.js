require('dotenv').config();

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OrderItem = sequelize.define('OrderItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products', // 🔗 denumirea exactă a tabelei în baza de date
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL' // ← opțional, în caz că produsul e șters
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  underscored: true
});

module.exports = OrderItem;