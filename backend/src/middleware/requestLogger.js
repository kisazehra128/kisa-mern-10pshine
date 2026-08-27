const pinoHttp = require('pino-http');
const logger = require('../config/logger');
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
