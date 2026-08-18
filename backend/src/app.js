const express = require("express");
const cors = require("cors");
const indexRoutes = require("./routes/index.routes");
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const notesRoutes = require('./routes/notes.routes');
const categoriesRoutes = require('./routes/categories.routes');
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const isProd = process.env.NODE_ENV === 'production';
if (isProd && !process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL must be set in production');
}
app.use(cors({
  origin: process.env.FRONTEND_URL || (isProd ? undefined : "http://localhost:5173"),
  credentials: true,
}));
app.use(requestLogger);
app.use(express.json());

app.use("/", indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/categories', categoriesRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;