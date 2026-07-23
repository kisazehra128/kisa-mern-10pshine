const express = require('express');
require('dotenv').config();

// 1. Make sure this exact line is at the top of server.js
const { pool, testConnection } = require('./src/config/db'); 

const app = express();

// Middleware
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running perfectly!' });
});

// The server start block
async function startServer() {
  try {
    // 2. This will now find the imported function correctly
    await testConnection();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running continuously on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start the server:', error.message);
    process.exit(1);
  }
}

startServer();
