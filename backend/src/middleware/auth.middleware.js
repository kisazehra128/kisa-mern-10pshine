const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../utils/tokenBlacklist');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  // expecting something like "Bearer eyJhbGciOi..."
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'no token provided' });
  }

  const token = authHeader.split(' ')[1];

  // rejects tokens that were explicitly logged out, even if they haven't
  // technically expired yet
  if (tokenBlacklist.isBlacklisted(token)) {
    return res.status(401).json({ message: 'invalid or expired token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId }
    next();
  } catch (err) {
    // covers both an expired token and a invalid one
    return res.status(401).json({ message: 'invalid or expired token' });
  }
}

module.exports = authenticate;
