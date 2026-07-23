require("dotenv").config();

const app = require("./src/app");

const port = Number(process.env.PORT);

const PORT =
  Number.isInteger(port) &&
  port > 0 &&
  port <= 65535
    ? port
    : 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});