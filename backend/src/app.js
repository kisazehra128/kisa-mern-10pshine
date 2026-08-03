const express = require("express");
const indexRoutes = require("./routes/index.routes");
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const notesRoutes = require('./routes/notes.routes');

const app = express();

app.use(express.json());

app.use("/", indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', notesRoutes);

module.exports = app;