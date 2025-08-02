const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
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
      isEmail: true // ⛑️ validare de email
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
  }
}, {
  tableName: 'users',
  timestamps: true // ✅ asigură generarea automată a createdAt și updatedAt
});

module.exports = User;