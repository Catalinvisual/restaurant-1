require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define(
  'User',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true // ⛑️ validare email
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_admin'
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login'
    }
  },
  {
    tableName: 'users',
    timestamps: true // ✅ adaugă automat createdAt și updatedAt
  }
);

// 🔍 Hook opțional pentru logarea ultimei autentificări
User.beforeUpdate((user, options) => {
  if (options.fields.includes('lastLogin')) {
    user.lastLogin = new Date();
  }
});

// 📦 Log în mediu local
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Modelul User a fost încărcat cu succes.');
}

module.exports = User;