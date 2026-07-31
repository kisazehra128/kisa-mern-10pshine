const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const { getCurrentUser } = require('../controllers/user.controller');

router.get('/me', authenticate, getCurrentUser);

module.exports = router;