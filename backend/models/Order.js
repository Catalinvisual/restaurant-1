require('dotenv').config(); // ✅ citește .env

const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // ✅ import corect
const User = require('./User');
const OrderItem = require('./OrderItem'); // 👈 asigură-te că fișierul există

const ENV = process.env.NODE_ENV || 'development';

const Order = sequelize.define(
  'Order',
  {
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255]
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    }
  },
  {
    tableName: 'orders',
    timestamps: true,
    underscored: true
  }
);

// 🔗 Relații cu User
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// 🔗 Relații cu OrderItems
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

if (ENV === 'development') {
  console.log('🔧 [Order Model] definit + relații stabilite.');
}

module.exports = Order;