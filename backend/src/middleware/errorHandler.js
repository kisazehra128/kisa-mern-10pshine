const logger = require('../config/logger');

// catches any request that didn't match a route above it
function notFound(req, res, next) {
  res.status(404).json({ message: `route not found: ${req.method} ${req.originalUrl}` });
}

// last middleware in the chain - every thrown/forwarded error ends up here.
// must be defined with 4 args (err, req, res, next) for Express to treat it
// as an error handler
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // operational errors (AppError, Joi validation failures) are expected -
  // log them at warn and it's safe to send the real message to the client.
  // anything else is an actual bug, log the full stack at error level and
  // don't leak internal details in the response
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
