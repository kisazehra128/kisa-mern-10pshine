const Joi = require('joi');

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
});

const updateNoteSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  content: Joi.string().allow('').optional(),
});

// express turns a repeated ?search=a&search=b into an array - Joi.string()
// rejects that automatically instead of letting it crash .toLowerCase() later
const searchQuerySchema = Joi.object({
  search: Joi.string().optional(),
}).unknown(true);

module.exports = {
  registerSchema,
  loginSchema,
  createNoteSchema,
  updateNoteSchema,
  searchQuerySchema,
};
