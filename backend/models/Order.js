require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Product = require('./Product');

const Order = sequelize.define(
  'Order',
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']]
      }
    }
  },
  {
    tableName: 'orders',
    timestamps: true // ✅ createdAt & updatedAt
  }
);

// 🔗 Relații între modele
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Order, { foreignKey: 'productId' });
Order.belongsTo(Product, { foreignKey: 'productId' });

// 🛠️ Log pentru dezvoltare
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Modelul Order a fost definit și relațiile stabilite.');
}

module.exports = Order;