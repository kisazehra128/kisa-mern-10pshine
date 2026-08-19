const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../utils/tokenBlacklist');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'no token provided' });
  }

  const token = authHeader.split(' ')[1];
if (tokenBlacklist.isBlacklisted(token)) {
    return res.status(401).json({ message: 'invalid or expired token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'invalid or expired token' });
  }
}

module.exports = authenticate;
