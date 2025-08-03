const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // verifică dacă path-ul e corect

const Menu = sequelize.define('Menu', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true, // ✅ permite null dacă nu se trimite imagine
    validate: {
      isUrl: true
    }
  }
}, {
  timestamps: true // ✅ adaugă createdAt & updatedAt
});

module.exports = Menu;