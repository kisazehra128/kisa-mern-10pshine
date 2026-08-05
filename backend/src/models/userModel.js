const { pool } = require('../config/db');
const logger = require('../config/logger');

const UserModel = {
  // password should already be hashed by the time it gets here 
  async create({ name, email, hashedPassword }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );
      return { id: result.insertId, name, email }; // not sending the hash back 
    } catch (err) {
      logger.error({ err }, 'UserModel.create failed');
      throw err;
    }
  },

  // used for login + checking if an email's already taken during signup
  // this one does return the password hash on purpose, login needs it to compare
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

  // for stuff like profile page, leaving password out here
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