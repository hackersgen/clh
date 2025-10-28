const express = require("express");
const compression = require("compression");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());

app.use(express.static(path.join(__dirname, ".")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ App running on http://localhost:${PORT}`);
});
