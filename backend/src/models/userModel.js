const { pool } = require('../config/db');
const logger = require('../config/logger');

const UserModel = {
   async create({ name, email, hashedPassword }, db = pool) {
    try {
      const [result] = await db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );
      return { id: result.insertId, name, email };  
    } catch (err) {
      logger.error({ err }, 'UserModel.create failed');
      throw err;
    }
  },
 async findByEmail(email) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (err) {
      logger.error({ err }, 'UserModel.findByEmail failed');
      throw err;
    }
  },

  async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT id, name, email, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (err) {
      logger.error({ err }, 'UserModel.findById failed');
      throw err;
    }
  }
};

module.exports = UserModel;