const noteModel = require('../models/noteModel');
const categoryModel = require('../models/categoryModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');
async function resolveCategory(userId, category) {
  if (!category) return null;
  const owned = await categoryModel.findBySlug(userId, category);
  if (!owned) {
    throw new AppError('category not found', 400);
  }
  return owned.slug;
}

async function resolveCategory(userId, category) {
  if (!category) return null;
  const owned = await categoryModel.findBySlug(userId, category);
  if (!owned) {
    throw new AppError('category not found', 400);
  }
  return owned.slug;
}

const createNote = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;
  const resolvedCategory = await resolveCategory(req.user.userId, category);

  const newNote = await noteModel.create({
    userId: req.user.userId,
    title,
    content: content || '',
    category: resolvedCategory,
  });

  logger.info({ userId: req.user.userId, noteId: newNote.id }, 'note created');

  res.status(201).json({ message: 'note created', note: newNote });
});

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ');
}

const getNotes = asyncHandler(async (req, res) => {
  const { search, category } = req.validatedQuery;
  const notes = await noteModel.findAllByUser(req.user.userId, category);

  if (!search) {
    res.status(200).json({ notes });
    return;
  }
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean);

  const filtered = notes.filter((n) => {
    const haystack = `${n.title} ${stripHtml(n.content)}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });

  res.status(200).json({ notes: filtered });
});

const getTrash = asyncHandler(async (req, res) => {
  const notes = await noteModel.findTrashByUser(req.user.userId);
  res.status(200).json({ notes });
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
  const resolvedCategory = await resolveCategory(req.user.userId, category);

  const updated = await noteModel.update(req.params.id, req.user.userId, {
    title,
    content: content || '',
    category: resolvedCategory,
  });

  if (!updated) {
    throw new AppError('note not found', 404);
  }

  logger.info({ userId: req.user.userId, noteId: req.params.id }, 'note updated');

  res.status(200).json({ message: 'note updated' });
});

const deleteNote = asyncHandler(async (req, res) => {
  const deleted = await noteModel.softDelete(req.params.id, req.user.userId);

  if (!deleted) {
    throw new AppError('note not found', 404);
  }

  logger.info({ userId: req.user.userId, noteId: req.params.id }, 'note moved to trash');

  res.status(200).json({ message: 'note moved to trash' });
});

const restoreNote = asyncHandler(async (req, res) => {
  const restored = await noteModel.restore(req.params.id, req.user.userId);

  if (!restored) {
    throw new AppError('note not found in trash', 404);
  }

  logger.info({ userId: req.user.userId, noteId: req.params.id }, 'note restored');

  res.status(200).json({ message: 'note restored' });
});

const permanentlyDeleteNote = asyncHandler(async (req, res) => {
  const deleted = await noteModel.permanentDelete(req.params.id, req.user.userId);

  if (!deleted) {
    throw new AppError('note not found in trash', 404);
  }

  logger.info({ userId: req.user.userId, noteId: req.params.id }, 'note permanently deleted');

  res.status(200).json({ message: 'note permanently deleted' });
});

module.exports = {
  createNote,
  getNotes,
  getTrash,
  getNoteById,
  updateNote,
  deleteNote,
  restoreNote,
  permanentlyDeleteNote,
};
