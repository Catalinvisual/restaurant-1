require('dotenv').config();

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ENV = process.env.NODE_ENV || 'development';

const Product = sequelize.define(
  'Product',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
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
      field: 'image_url',
      validate: {
        isUrl: true
      }
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0.01
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'uncategorized'
    }
  },
  {
    tableName: 'products',
    freezeTableName: true,
    timestamps: true
  }
);

if (ENV === 'development') {
  console.log('🔧 [Product Model] încărcat cu succes');
}

// 🔗 Relații
Product.associate = (models) => {
  // Un produs poate apărea în mai multe OrderItems
  Product.hasMany(models.OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
};

module.exports = Product;
