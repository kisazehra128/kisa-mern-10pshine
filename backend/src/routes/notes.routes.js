const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote
} = require('../controllers/notes.controller');

// every note route needs a valid token - nobody's notes without logging in
router.use(authenticate);

router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;