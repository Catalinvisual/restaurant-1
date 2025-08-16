require('dotenv').config();

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ENV = process.env.NODE_ENV || 'development';

const Order = sequelize.define(
  'Order',
  {
    customer_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 100] }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 255] }
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    totalPrice: { // 👈 folosit camelCase în model
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'total_price' // mapare la coloana din DB
    }
  },
  {
    tableName: 'orders',
    timestamps: true,
    underscored: true
  }
);

if (ENV === 'development') {
  console.log('🔧 [Order Model] încărcat cu succes');
}

// 🔗 Relații
Order.associate = (models) => {
  // Legătură cu User
  Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

  // Legătură cu OrderItem
  Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
};

module.exports = Order;
