const noteModel = require('../models/noteModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');

const createNote = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;

  const newNote = await noteModel.create({
    userId: req.user.userId,
    title,
    content: content || '',
    category: category || null,
  });

  logger.info({ userId: req.user.userId, noteId: newNote.id }, 'note created');

  res.status(201).json({ message: 'note created', note: newNote });
});

const getNotes = asyncHandler(async (req, res) => {
const { search, category } = req.validatedQuery;
  const notes = await noteModel.findAllByUser(req.user.userId, category);

  const filtered = search
    ? notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        (n.content && n.content.toLowerCase().includes(search.toLowerCase()))
      )
    : notes;

  res.status(200).json({ notes: filtered });
});

const getNoteById = asyncHandler(async (req, res) => {
  const note = await noteModel.findById(req.params.id, req.user.userId);

  if (!note) {
    throw new AppError('note not found', 404);
  }

  res.status(200).json({ note });
});

const updateNote = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;

  const updated = await noteModel.update(req.params.id, req.user.userId, {
    title,
    content: content || '',
    category: category || null,
  });

  if (!updated) {
     throw new AppError('note not found', 404);
  }

  logger.info({ userId: req.user.userId, noteId: req.params.id }, 'note updated');

  res.status(200).json({ message: 'note updated' });
});

const deleteNote = asyncHandler(async (req, res) => {
  const deleted = await noteModel.delete(req.params.id, req.user.userId);

  if (!deleted) {
    throw new AppError('note not found', 404);
  }

  logger.info({ userId: req.user.userId, noteId: req.params.id }, 'note deleted');

  res.status(200).json({ message: 'note deleted' });
});

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote };
