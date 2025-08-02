require('dotenv').config();
const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  // ✅ Pe Render sau alt host cu DATABASE_URL (recomandat)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  });
} else {
  // ✅ Pentru rulare locală (folosește variabile separate)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'postgres',
      port: process.env.DB_PORT || 5432
    }
  );
}

// 🔍 Test conexiune
sequelize.authenticate()
  .then(() => console.log('✅ Conectat la PostgreSQL'))
  .catch(err => console.error('❌ Eroare conexiune:', err.message));

module.exports = sequelize;