const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const userModel = require('../models/userModel');
const categoryModel = require('../models/categoryModel');
const defaultCategories = require('../utils/defaultCategories');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');
const tokenBlacklist = require('../utils/tokenBlacklist');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    throw new AppError('that email is already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
 const connection = await pool.getConnection();
  let newUser;
  try {
    await connection.beginTransaction();

    newUser = await userModel.create({ name, email, hashedPassword }, connection);

    await Promise.all(
      defaultCategories.map((cat) => categoryModel.create({ userId: newUser.id, ...cat }, connection))
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError('that email is already registered', 409);
    }
    throw err;
  } finally {
    connection.release();
  }

  logger.info({ userId: newUser.id }, 'user registered');

  res.status(201).json({
    message: 'user registered',
    user: newUser,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await userModel.findByEmail(email);
  } catch (err) {
    logger.error({ err }, 'failed to look up user during login');
    throw err;
  }

  if (!user) {
    throw new AppError('invalid email or password', 401);
  }

  let passwordMatches;
  try {
    passwordMatches = await bcrypt.compare(password, user.password);
  } catch (err) {
    logger.error({ err, userId: user.id }, 'failed to compare password during login');
    throw err;
  }

  if (!passwordMatches) {
    throw new AppError('invalid email or password', 401);
  }

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

const logout = asyncHandler(async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);

    tokenBlacklist.add(token, decoded && decoded.exp);

    logger.info({ userId: req.user.userId }, 'user logged out');

    res.status(200).json({ message: 'logged out' });
  } catch (err) {
    logger.error({ err, userId: req.user?.userId }, 'failed to log out user');
    throw err;
  }
});

module.exports = { register, login, logout };