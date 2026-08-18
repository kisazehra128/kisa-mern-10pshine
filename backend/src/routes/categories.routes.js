const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const { createCategorySchema } = require('../validation/schemas');
const { createCategory, getCategories, deleteCategory } = require('../controllers/categories.controller');

router.use(authenticate);

router.get('/', getCategories);
router.post('/', validate(createCategorySchema), createCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
