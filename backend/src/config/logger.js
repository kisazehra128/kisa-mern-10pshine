const pino = require('pino');

const isDev = process.env.NODE_ENV !== 'production';

// pretty-printed, colorized logs in dev; plain JSON in production
// (JSON is what you actually want once logs are going to a real log
// aggregator instead of a terminal)
const logger = pino(
  isDev
    ? {
        level: process.env.LOG_LEVEL || 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        level: process.env.LOG_LEVEL || 'info',
      }
);

module.exports = logger;
