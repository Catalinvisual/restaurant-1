require('dotenv').config(); // Încarcă variabilele din .env

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Conectat la PostgreSQL'))
  .catch(err => console.error('❌ Eroare conexiune:', err));

module.exports = sequelize;