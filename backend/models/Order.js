const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Product = require('./Product');

const Order = sequelize.define('Order', {
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  address: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'pending' }
});

// Relații
User.hasMany(Order);
Order.belongsTo(User);

Product.hasMany(Order);
Order.belongsTo(Product);

module.exports = Order;