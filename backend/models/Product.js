require('dotenv').config(); // ✅ folosește implicit fișierul .env

const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // ✅ import corect

const ENV = process.env.NODE_ENV || 'development';

// 🔁 Importă OrderItem pentru relație
const OrderItem = require('./OrderItem');

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
      field: 'image_url', // 🛠️ mapare clară către DB
      validate: {
        isUrl: true // 💡 validare opțională pentru URL imagine
      }
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

// 🔗 Relație: un produs poate avea mai multe OrderItems
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' }); // ✅ relație inversă

// 📦 Log doar în mediul local
if (ENV === 'development') {
  console.log('🔧 [Product Model] încărcat cu succes + relații setate');
}

module.exports = Product;