require('dotenv').config();

const logger = require('./src/config/logger');
const { pool, testConnection } = require('./src/config/db');
const app = require('./src/app');

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is missing from .env — server cannot start without it.');
      process.exit(1);
    }

    await testConnection();

    const port = Number(process.env.PORT);
    const PORT =
      Number.isInteger(port) &&
      port > 0 &&
      port <= 65535
        ? port
        : 5000;

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      logger.error({ err }, 'Server failed to start');
      process.exit(1);
    });

  } catch (error) {
    logger.error({ err: error }, 'Failed to start the server');
    process.exit(1);
  }
}

startServer();
