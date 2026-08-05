const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');
const tokenBlacklist = require('../utils/tokenBlacklist');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // don't let someone sign up twice with the same email
  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    throw new AppError('that email is already registered', 409);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({ name, email, hashedPassword });

    logger.info({ userId: newUser.id }, 'user registered');

    res.status(201).json({
      message: 'user registered',
      user: newUser,
    });
  } catch (err) {
    // covers the case where two requests both pass the findByEmail check
    // above at the same time - the DB's UNIQUE constraint catches it here
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError('that email is already registered', 409);
    }
    throw err;
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);

  // keeping this vague on purpose, don't want to tell people
  // whether it was the email or the password that was wrong
  if (!user) {
    throw new AppError('invalid email or password', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new AppError('invalid email or password', 401);
  }

  // just the id in here - keeping the token small and not putting
  // extra personal info in something that gets sent around
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1h', jwtid: crypto.randomUUID() }
  );

  logger.info({ userId: user.id }, 'user logged in');

  res.status(200).json({
    message: 'logged in',
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// JWTs are stateless, so "logging out" means blacklisting this specific
// token until it would have expired anyway - the client also discards its
// copy, but this stops the same token being reused server-side if it leaks
const logout = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const decoded = jwt.decode(token);

  tokenBlacklist.add(token, decoded && decoded.exp);

  logger.info({ userId: req.user.userId }, 'user logged out');

  res.status(200).json({ message: 'logged out' });
});

module.exports = { register, login, logout };
