const pinoHttp = require('pino-http');
const logger = require('../config/logger');

// logs every request/response with method, url, status, and response time -
// redacts the Authorization header so JWTs never end up in the logs
const requestLogger = pinoHttp({
  logger,
  redact: {
    paths: ['req.headers.authorization'],
    censor: '[redacted]',
  },
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.originalUrl} -> ${res.statusCode}`,
  customErrorMessage: (req, res, err) => `${req.method} ${req.originalUrl} -> ${res.statusCode} (${err.message})`,
});

module.exports = requestLogger;
