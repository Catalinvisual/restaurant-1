require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const { Sequelize } = require('sequelize');

const ENV = process.env.NODE_ENV || 'development';
console.log(`🔍 Mediul activ în db.js: ${ENV}`);

let sequelize;

if (process.env.DATABASE_URL && ENV === 'production') {
  // 🌍 Conectare pe Render sau alt host live
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  // 💻 Conectare locală
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'postgres',
      port: process.env.DB_PORT || 5432,
      logging: ENV === 'development' // log-uri doar în local
    }
  );
}

sequelize
  .authenticate()
  .then(() => console.log('✅ Conexiune reușită cu PostgreSQL'))
  .catch((err) => console.error('❌ Eroare la conectarea DB:', err.message));

module.exports = sequelize;