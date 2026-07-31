const userModel = require('../models/userModel');

async function getCurrentUser(req, res) {
  try {
    const user = await userModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error('UserController.getCurrentUser failed:', err.message);
    res.status(500).json({ message: 'Something went wrong fetching user.' });
  }
}

module.exports = { getCurrentUser };