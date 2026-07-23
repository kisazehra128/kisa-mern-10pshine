const express = require ("express");
const app = express();
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);
app.use(express.json());
module.exports = app;