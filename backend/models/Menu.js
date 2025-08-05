require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Menu = sequelize.define(
  'Menu',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100] // ⛑️ între 2 și 100 caractere
      }
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0.01 // 💰 preț minim
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true // 🔗 validare URL
      }
    },
    isNew: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPromo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: 'menu',
    timestamps: true // ✅ include createdAt & updatedAt
  }
);

// 🔍 Log în mediu local
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Modelul Menu a fost încărcat cu succes.');
}

module.exports = Menu;