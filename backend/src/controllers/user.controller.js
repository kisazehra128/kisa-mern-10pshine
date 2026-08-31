const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');

const getCurrentUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    res.status(200).json({ user });
  } catch (err) {
    if (!(err instanceof AppError)) {
      logger.error({ err, userId: req.user.userId }, 'failed to fetch current user');
    }
    return next(err);
  }
});

module.exports = { getCurrentUser };
