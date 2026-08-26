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

async function ensureNoteTrashColumn(connection) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'notes'
       AND COLUMN_NAME = 'deleted_at'`
  );

  if (!rows[0].count) {
    await connection.query('ALTER TABLE notes ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL');
  }
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await ensureNoteTrashColumn(connection);
    logger.info('MySQL connected successfully');
    connection.release();
  } catch (err) {
    logger.error({ err }, 'MySQL connection failed');
    throw err;
  }
}

module.exports = { pool, testConnection };