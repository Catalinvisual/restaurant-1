require('dotenv').config(); // ✅ citește implicit fișierul .env


const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ENV = process.env.NODE_ENV || 'development';

const User = sequelize.define(
  'User',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50] // 👤 Evită nume prea scurte
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_admin' // 🛠️ Mapping către coloana DB
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login'
    }
  },
  {
    tableName: 'users',
    timestamps: true // Adaugă createdAt / updatedAt automat
  }
);

// 🔍 Hook: actualizare lastLogin
User.beforeUpdate((user, options) => {
  if (options.fields?.includes('lastLogin')) {
    user.lastLogin = new Date();
  }
});

// 📦 Log local pentru confirmare
if (ENV === 'development') {
  console.log('🔧 [User Model] încărcat cu succes');
}

module.exports = User;