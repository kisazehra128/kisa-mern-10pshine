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
  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'notes'
         AND COLUMN_NAME = 'deleted_at'`
    );

    if (!rows[0].count) {
      try {
        await connection.query('ALTER TABLE notes ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL');
      } catch (err) {
        // Another instance may have added the column between our check and this ALTER.
        if (err.code !== 'ER_DUP_FIELDNAME') throw err;
      }
    }
  } catch (err) {
    logger.error({ err }, 'failed to ensure notes.deleted_at column');
    throw err;
  }
}

async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await ensureNoteTrashColumn(connection);
    logger.info('MySQL connected successfully');
  } catch (err) {
    logger.error({ err }, 'MySQL connection failed');
    throw err;
  } finally {
    connection?.release();
  }
}

module.exports = { pool, testConnection };