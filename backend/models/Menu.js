const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // asigură-te că acest path e corect

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
    type: DataTypes.STRING // dacă vrei să salvezi URL-ul pozei
  }
});

module.exports = Menu;