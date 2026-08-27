const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  res.status(200).json({ user });
});

module.exports = { getCurrentUser };
