require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    tableName: 'refresh_tokens',
    timestamps: true // ✅ asigură createdAt și updatedAt
  }
);

// 📦 Log doar în mediu local
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Modelul RefreshToken a fost încărcat.');
}

module.exports = RefreshToken;