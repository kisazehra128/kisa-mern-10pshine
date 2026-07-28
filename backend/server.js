require('dotenv').config();

const { pool, testConnection } = require('./src/config/db');
const app = require('./src/app');

async function startServer() {
  try {
    await testConnection();

    const port = Number(process.env.PORT);
    const PORT =
      Number.isInteger(port) &&
      port > 0 &&
      port <= 65535
        ? port
        : 5000;

    const server = app.listen(PORT, () => {
      console.log(`Server running continuously on port ${PORT}`);
    });

    server.on('error', (err) => {
      console.error('❌ Server failed to start:', err.message);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start the server:', error.message);
    process.exit(1);
  }
}

startServer();