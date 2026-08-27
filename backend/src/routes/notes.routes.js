const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const {
  createNoteSchema,
  updateNoteSchema,
  searchQuerySchema,
} = require('../validation/schemas');
const {
  createNote,
  getNotes,
  getTrash,
  getNoteById,
  updateNote,
  deleteNote,
  restoreNote,
  permanentlyDeleteNote,
} = require('../controllers/notes.controller');

router.use(authenticate);

router.post('/', validate(createNoteSchema), createNote);
router.get('/', validate(searchQuerySchema, 'query'), getNotes);
router.get('/trash', getTrash);
router.patch('/:id/restore', restoreNote);
router.delete('/:id/permanent', permanentlyDeleteNote);
router.get('/:id', getNoteById);
router.put('/:id', validate(updateNoteSchema), updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
