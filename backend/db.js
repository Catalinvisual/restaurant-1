require('dotenv').config();        // 🔐 Încarcă .env
const { Sequelize } = require('sequelize');

const ENV = process.env.NODE_ENV || 'development';

let sequelize;

if (process.env.DATABASE_URL && ENV === 'production') {
  sequelize = new Sequelize(                           
    process.env.DATABASE_URL.replace(/^postgresql/, 'postgres'),
    {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
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
  .then(() => console.log(`✅ Conexiune DB reușită (${ENV})`))
  .catch(err => console.error('❌ Eroare conectare DB:', err));

module.exports = sequelize;     // ✅ Export direct instanță