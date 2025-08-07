require('dotenv').config(); // ✅ citește implicit fișierul .env

const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // ✅ import direct

const ENV = process.env.NODE_ENV || 'development';

const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [32, 512] // 🔐 tokenuri JWT sunt lungi
      }
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
    timestamps: true, // ✅ createdAt & updatedAt
    underscored: true // 🧠 transformă camelCase în snake_case
  }
);

// 📦 Log local pentru confirmare
if (ENV === 'development') {
  console.log('🔧 [RefreshToken Model] încărcat cu succes');
}

module.exports = RefreshToken;