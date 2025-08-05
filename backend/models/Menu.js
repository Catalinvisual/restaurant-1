require('dotenv').config(); // ✅ citește implicit fișierul .env

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ENV = process.env.NODE_ENV || 'development';

const Menu = sequelize.define(
  'Menu',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      },
      field: 'image_url' // 🔗 mapare explicită către DB dacă folosești snake_case
    },
    isNew: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_new'
    },
    isPromo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_promo'
    }
  },
  {
    tableName: 'menu',
    timestamps: true,
    underscored: true // 🧠 created_at, updated_at în loc de camelCase
  }
);

// 🔍 Log în mediu local
if (ENV === 'development') {
  console.log('🔧 [Menu Model] încărcat cu succes');
}

module.exports = Menu;