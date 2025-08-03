// models/RefreshToken.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const RefreshToken = sequelize.define('RefreshToken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'refresh_tokens',
  timestamps: true
});

module.exports = RefreshToken;