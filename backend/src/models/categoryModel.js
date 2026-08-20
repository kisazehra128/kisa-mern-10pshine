const { pool } = require('../config/db');
const logger = require('../config/logger');

const CategoryModel = {
  async create({ userId, name, slug, icon }, db = pool) {
    try {
      const [result] = await db.query(
        'INSERT INTO categories (user_id, name, slug, icon) VALUES (?, ?, ?, ?)',
        [userId, name, slug, icon]
      );
      return { id: result.insertId, userId, name, slug, icon };
    } catch (err) {
      logger.error({ err }, 'CategoryModel.create failed');
      throw err;
    }
  },

  async findAllByUser(userId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM categories WHERE user_id = ? ORDER BY created_at ASC',
        [userId]
      );
      return rows;
    } catch (err) {
      logger.error({ err }, 'CategoryModel.findAllByUser failed');
      throw err;
    }
  },

  async findBySlug(userId, slug) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM categories WHERE user_id = ? AND slug = ?',
        [userId, slug]
      );
      return rows[0];
    } catch (err) {
      logger.error({ err }, 'CategoryModel.findBySlug failed');
      throw err;
    }
  },
async findById(id, userId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM categories WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return rows[0];
    } catch (err) {
      logger.error({ err }, 'CategoryModel.findById failed');
      throw err;
    }
  },

  async deleteById(id, userId, db = pool) {
    try {
      const [result] = await db.query(
        'DELETE FROM categories WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      logger.error({ err }, 'CategoryModel.deleteById failed');
      throw err;
    }
  },
};

module.exports = CategoryModel;