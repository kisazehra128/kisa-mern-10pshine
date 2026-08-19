const logger = require('../config/logger');

function notFound(req, res, next) {
  res.status(404).json({ message: `route not found: ${req.method} ${req.originalUrl}` });
}
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  if (err.isOperational) {
    logger.warn({ err }, err.message);
  } else {
    logger.error({ err }, 'Unexpected error');
  }

 res.status(statusCode).json({
    message: err.isOperational ? err.message : 'something went wrong, try again',
  });
}

module.exports = { notFound, errorHandler };
