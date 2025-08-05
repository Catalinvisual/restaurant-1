require('dotenv').config(); // ✅ citește direct .env


const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Product = require('./Product');

const ENV = process.env.NODE_ENV || 'development';

const Order = sequelize.define(
  'Order',
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        isInt: true // 👈 validare suplimentară
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 255] // 📦 limitează dimensiunea câmpului
      }
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
    timestamps: true,
    underscored: true // 🧠 created_at, updated_at în DB
  }
);

// 🔗 Relații între modele
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(Order, { foreignKey: 'product_id' });
Order.belongsTo(Product, { foreignKey: 'product_id' });

// 🛠️ Log pentru dezvoltare
if (ENV === 'development') {
  console.log('🔧 [Order Model] definit + relații stabilite.');
}

module.exports = Order;