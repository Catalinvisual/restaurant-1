require('dotenv').config();

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ENV = process.env.NODE_ENV || 'development';

const OrderItem = sequelize.define(
  'OrderItem',
  {
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  },
  {
    tableName: 'order_items',
    timestamps: true,
    underscored: true
  }
);

if (ENV === 'development') {
  console.log('🔧 [OrderItem Model] încărcat cu succes');
}

// 🔗 Relații
OrderItem.associate = (models) => {
  // Legătură cu Order
  OrderItem.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });

  // Legătură cu Product
  OrderItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
};

module.exports = OrderItem;
