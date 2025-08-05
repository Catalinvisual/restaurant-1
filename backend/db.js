require('dotenv').config(); // 🔧 folosește fișierul .env

const { Sequelize } = require('sequelize');

const ENV = process.env.NODE_ENV || 'development';
console.log(`🔍 Mediul activ în db.js: ${ENV}`);

console.log('📦 Variabile DB:', {
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_DIALECT: process.env.DB_DIALECT,
  DATABASE_URL: process.env.DATABASE_URL
});

let sequelize;

if (process.env.DATABASE_URL && ENV === 'production') {
  sequelize = new Sequelize(
    process.env.DATABASE_URL.replace(/^postgresql/, 'postgres'),
    {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    }
  );
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'postgres',
      port: Number(process.env.DB_PORT) || 5432,
      logging: ENV === 'development'
    }
  );
}

sequelize
  .authenticate()
  .then(() => console.log('✅ Conexiune reușită cu PostgreSQL'))
  .catch((err) => {
    console.error('❌ Eroare la conectarea DB:');
    console.error(err);
  });

module.exports = sequelize;