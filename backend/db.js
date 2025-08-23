// 🔐 Încarcă variabilele din .env
require('dotenv').config();
const { Sequelize } = require('sequelize');

const ENV = process.env.NODE_ENV || 'development';
const useSSL = process.env.DB_SSL === 'true';

let sequelize;

// 🌐 Conexiune producție (Render / alt server)
if (process.env.DATABASE_URL && ENV === 'production') {
  sequelize = new Sequelize(
    process.env.DATABASE_URL.replace(/^postgresql/, 'postgres'),
    {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: useSSL ? { require: true, rejectUnauthorized: false } : false
      },
      logging: false
    }
  );
}
// 💻 Conexiune locală
else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'postgres',
      port: Number(process.env.DB_PORT) || 5432,
      dialectOptions: {
        ssl: useSSL ? { require: true, rejectUnauthorized: false } : false
      },
      logging: ENV === 'development'
    }
  );
}

// 🔎 Test conexiune DB
sequelize.authenticate()
  .then(() => console.log(`✅ Conexiune DB reușită (${ENV})`))
  .catch(err => console.error('❌ Eroare conectare DB:', err));

module.exports = sequelize;
