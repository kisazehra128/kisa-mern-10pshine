const { pool } = require('../config/db');

const NoteModel = {
  async create({ userId, title, content }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
        [userId, title, content]
      );
      return { id: result.insertId, userId, title, content };
    } catch (err) {
      console.error('NoteModel.create failed:', err.message);
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
      console.error('NoteModel.findAllByUser failed:', err.message);
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
      console.error('NoteModel.findById failed:', err.message);
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
      console.error('NoteModel.update failed:', err.message);
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
      console.error('NoteModel.delete failed:', err.message);
      throw err;
    }
  }
};

module.exports = NoteModel;