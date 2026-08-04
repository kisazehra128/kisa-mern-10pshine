const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validation/schemas');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authenticate, logout);

module.exports = router;
