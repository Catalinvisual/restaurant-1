require('dotenv').config();

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
        notEmpty: { msg: 'Numele nu poate fi gol' },
        len: { args: [2, 100], msg: 'Numele trebuie să aibă între 2 și 100 de caractere' }
      }
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: { msg: 'Prețul trebuie să fie un număr' },
        min: { args: [0.01], msg: 'Prețul trebuie să fie pozitiv' }
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
        isUrl: { msg: 'Imaginea trebuie să fie un URL valid' }
      },
      field: 'image_url'
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
    underscored: true,
    freezeTableName: true // 🔒 evită pluralizarea automată
  }
);

// 🔍 Log în dezvoltare
if (ENV === 'development') {
  console.log('🔧 [Menu Model] definit corect pentru PostgreSQL');
}

module.exports = Menu;