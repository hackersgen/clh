const express = require("express");
const compression = require("compression");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.BASE_PATH || "/";

app.use(compression());

const normalizedBase = BASE_PATH.startsWith("/") ? BASE_PATH : `/${BASE_PATH}`;
const basePath = normalizedBase.endsWith("/")
  ? normalizedBase
  : `${normalizedBase}/`;

app.use(basePath, express.static(path.join(__dirname, ".")));

app.get(basePath, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app
  .listen(PORT)
  .on("listening", () => {
    console.log(`🚀 App running at http://localhost:${PORT}${basePath}`);
  })
  .on("error", err => {
    console.error("❌ Server error:", err);
  });
