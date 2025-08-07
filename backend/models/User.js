require('dotenv').config();        // 🔐 Încarcă .env (opțional, o singură dată la intrare)

const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // ✅ Import direct instanță

const ENV = process.env.NODE_ENV || 'development';

const User = sequelize.define(
  'User',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { len: [3, 50] }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
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
    timestamps: true
  }
);

User.beforeUpdate((user, options) => {
  if (options.fields?.includes('lastLogin')) {
    user.lastLogin = new Date();
  }
});

if (ENV === 'development') {
  console.log('🔧 [User Model] încărcat cu succes');
}

module.exports = User;