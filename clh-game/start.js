const express = require("express");
const compression = require("compression");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.BASE_PATH || "/";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3002";

app.use(compression());

const normalizedBase = BASE_PATH.startsWith("/") ? BASE_PATH : `/${BASE_PATH}`;
const basePath = normalizedBase.endsWith("/")
  ? normalizedBase
  : `${normalizedBase}/`;

app.use(basePath, express.static(path.join(__dirname, ".")));

app.get(basePath, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/env.js", (req, res) => {
  res.type("application/javascript");
  res.send(`
    window.__ENV__ = {
      BACKEND_URL: ${JSON.stringify(BACKEND_URL)},
    };
  `);
});

app
  .listen(PORT)
  .on("listening", () => {
    console.log(`🚀 App running at http://localhost:${PORT}${basePath}`);
  })
  .on("error", err => {
    console.error("❌ Server error:", err);
  });
