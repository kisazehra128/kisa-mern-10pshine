const mysql = require('mysql2/promise');
require('dotenv').config();
const logger = require('./logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected MySQL pool error');
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    logger.info('MySQL connected successfully');
    connection.release();
  } catch (err) {
    logger.error({ err }, 'MySQL connection failed');
    throw err;
  }
}

module.exports = { pool, testConnection };