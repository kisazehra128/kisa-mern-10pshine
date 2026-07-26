const { pool } = require('../config/db');

const NoteModel = {
  // creates a note, ties it to the logged in user
  async create({ userId, title, content }) {
    const [result] = await pool.query(
      'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
      [userId, title, content]
    );
    return { id: result.insertId, userId, title, content };
  },

  // dashboard uses this - most recently edited notes on top
  async findAllByUser(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    return rows;
  },

  async findById(id, userId) {
    // checking user_id here too so someone cant just change the note id in the url
    // and open somebody else's note. 
    const [rows] = await pool.query(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0]; // will be undefined if it's not theirs
  },

  async update(id, userId, { title, content }) {
    const [result] = await pool.query(
      'UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?',
      [title, content, id, userId]
    );
    return result.affectedRows > 0;
  },

  // same ownership check as above, don't wanna let ppl delete notes that arent theirs
  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
};
module.exports = NoteModel;