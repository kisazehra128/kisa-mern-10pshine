const express = require("express");
const cors = require("cors");
const indexRoutes = require("./routes/index.routes");
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const notesRoutes = require('./routes/notes.routes');
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(requestLogger);
app.use(express.json());

app.use("/", indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', notesRoutes);

// catches unmatched routes, then the error handler catches everything else -
// order matters, both have to come after all the real routes above
app.use(notFound);
app.use(errorHandler);

module.exports = app;
