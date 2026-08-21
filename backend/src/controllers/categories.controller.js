const categoryModel = require('../models/categoryModel');
const noteModel = require('../models/noteModel');
const { pool } = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');
const slugify = require('../utils/slugify');

const DEFAULT_ICON = 'folder.png';

const createCategory = asyncHandler(async (req, res) => {
  const { name, icon } = req.body;
  const slug = slugify(name);

  if (!slug) {
    throw new AppError('give the category a name with at least one letter or number', 400);
  }

  const existing = await categoryModel.findBySlug(req.user.userId, slug);
  if (existing) {
    throw new AppError('you already have a category like that', 409);
  }

  let category;
  try {
    category = await categoryModel.create({
      userId: req.user.userId,
      name: name.trim(),
      slug,
      icon: icon || DEFAULT_ICON,
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError('you already have a category like that', 409);
    }
    throw err;
  }

  logger.info({ userId: req.user.userId, categoryId: category.id }, 'category created');

  res.status(201).json({ message: 'category created', category });
});
const getCategories = asyncHandler(async (req, res) => {
  const [categories, countRows] = await Promise.all([
    categoryModel.findAllByUser(req.user.userId),
    noteModel.countByCategory(req.user.userId),
  ]);

  const countBySlug = {};
  let total = 0;
  for (const row of countRows) {
    total += row.count;
    if (row.category) countBySlug[row.category] = row.count;
  }

  const withCounts = categories.map((cat) => ({
    ...cat,
    count: countBySlug[cat.slug] || 0,
  }));

  res.status(200).json({ total, categories: withCounts });
});
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoryModel.findById(req.params.id, req.user.userId);
  if (!category) {
    throw new AppError('category not found', 404);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const deleted = await categoryModel.deleteById(req.params.id, req.user.userId, connection);
    if (!deleted) {
       throw new AppError('category not found', 404);
    }

    await noteModel.clearCategory(req.user.userId, category.slug, connection);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  logger.info({ userId: req.user.userId, categoryId: category.id }, 'category deleted');

  res.status(200).json({ message: 'category deleted' });
});

module.exports = { createCategory, getCategories, deleteCategory };