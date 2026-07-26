const { pool } = require('../config/db');

const UserModel = {
  // password should already be hashed by the time it gets here
  async create({ name, email, hashedPassword }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return { id: result.insertId, name, email }; // not sending the hash back out
  },

  // used for login + checking if an email's already taken during signup
  // this one does return the password hash on purpose, login needs it to compare
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  // for stuff like profile page, leaving password out here
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
};

module.exports = UserModel;