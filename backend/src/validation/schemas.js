const Joi = require('joi');
const ICON_VALUES = [
  'folder.png', 'grocery.png', 'personal.png', 'study.png', 'ideas.png',
  'note.png', 'notepad.png', 'clip.png', 'dash.png',
];
const categorySlug = Joi.string().trim().lowercase().max(40);

const registerSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

const createNoteSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  content: Joi.string().allow('').optional(),
  category: categorySlug.allow(null, '').optional(),
});

const updateNoteSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  content: Joi.string().allow('').optional(),
  category: categorySlug.allow(null, '').optional(),
});
const searchQuerySchema = Joi.object({
  search: Joi.string().optional(),
  category: categorySlug.optional(),
}).unknown(true);

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(30).required(),
  icon: Joi.string().valid(...ICON_VALUES).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createNoteSchema,
  updateNoteSchema,
  searchQuerySchema,
  createCategorySchema,
  ICON_VALUES,
};
