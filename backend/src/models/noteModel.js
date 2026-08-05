const { pool } = require('../config/db');
const logger = require('../config/logger');

const NoteModel = {
  async create({ userId, title, content }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
        [userId, title, content]
      );
      return { id: result.insertId, userId, title, content };
    } catch (err) {
      logger.error({ err }, 'NoteModel.create failed');
      throw err;
    }
  },

  // dashboard uses this, most recently edited notes on top
  async findAllByUser(userId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      );
      return rows;
    } catch (err) {
      logger.error({ err }, 'NoteModel.findAllByUser failed');
      throw err;
    }
  },

  async findById(id, userId) {
    // checking user_id here too so someone cant just change the note id in the url
    // and open somebody else's note
    try {
      const [rows] = await pool.query(
        'SELECT * FROM notes WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return rows[0]; // will be undefined if it's not theirs
    } catch (err) {
      logger.error({ err }, 'NoteModel.findById failed');
      throw err;
    }
  },

  async update(id, userId, { title, content }) {
    try {
      const [result] = await pool.query(
        'UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?',
        [title, content, id, userId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      logger.error({ err }, 'NoteModel.update failed');
      throw err;
    }
  },

  // same ownership check as above, don't wanna let ppl delete notes that arent theirs
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