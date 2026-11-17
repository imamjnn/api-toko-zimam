import dotenv from 'dotenv';
import knex from 'knex';

dotenv.config();

export default knex({
  // mysql2: driver lama `mysql` tidak mendukung caching_sha2_password (default MySQL 8.4)
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    // Samakan perilaku dengan driver lama: DECIMAL/SUM sebagai angka, kolom JSON sebagai string
    decimalNumbers: true,
    jsonStrings: true,
  },
  log: {
    error(message) {
      console.log('db error', message);
    },
  },
});
