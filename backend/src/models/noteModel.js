const { pool } = require('../config/db');
const logger = require('../config/logger');

const NoteModel = {
  async create({ userId, title, content, category }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO notes (user_id, title, content, category) VALUES (?, ?, ?, ?)',
        [userId, title, content, category || null]
      );
      return { id: result.insertId, userId, title, content, category: category || null };
    } catch (err) {
      logger.error({ err }, 'NoteModel.create failed');
      throw err;
    }
  },
  async findAllByUser(userId, category) {
    try {
      const [rows] = category
        ? await pool.query(
            'SELECT * FROM notes WHERE user_id = ? AND category = ? ORDER BY updated_at DESC',
            [userId, category]
          )
        : await pool.query(
            'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
            [userId]
          );
      return rows;
    } catch (err) {
      logger.error({ err }, 'NoteModel.findAllByUser failed');
      throw err;
    }
  },
 async countByCategory(userId) {
    try {
      const [rows] = await pool.query(
        'SELECT category, COUNT(*) AS count FROM notes WHERE user_id = ? GROUP BY category',
        [userId]
      );
      return rows;
    } catch (err) {
      logger.error({ err }, 'NoteModel.countByCategory failed');
      throw err;
    }
  },
  async clearCategory(userId, category, db = pool) {
    try {
      const [result] = await db.query(
        'UPDATE notes SET category = NULL WHERE user_id = ? AND category = ?',
        [userId, category]
      );
      return result.affectedRows;
    } catch (err) {
      logger.error({ err }, 'NoteModel.clearCategory failed');
      throw err;
    }
  },

  async findById(id, userId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM notes WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return rows[0]; 
    } catch (err) {
      logger.error({ err }, 'NoteModel.findById failed');
      throw err;
    }
  },

  async update(id, userId, { title, content, category }) {
    try {
      const [result] = await pool.query(
        'UPDATE notes SET title = ?, content = ?, category = ? WHERE id = ? AND user_id = ?',
        [title, content, category || null, id, userId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      logger.error({ err }, 'NoteModel.update failed');
      throw err;
    }
  },

  async delete(id, userId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM notes WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      logger.error({ err }, 'NoteModel.delete failed');
      throw err;
    }
  }
};

module.exports = NoteModel;