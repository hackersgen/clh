"use strict";

const path = require("node:path");
const AutoLoad = require("@fastify/autoload");
const cors = require("@fastify/cors");
const rateLimit = require("@fastify/rate-limit");

// Pass --options via CLI arguments in command to enable these options.
const options = {};

module.exports = async function (fastify, opts) {
  const basePath = process.env.BASE_PATH || "/";

  // Normalize prefix: ensure it starts with '/' but no trailing '/'
  const normalizedPrefix = basePath.startsWith("/") ? basePath : `/${basePath}`;
  const prefix = normalizedPrefix.replace(/\/+$/, "") || "/";

  fastify.register(cors, {
    origin: "*",
  });

  fastify.register(rateLimit, {
    max: 1000, // max requests per timeWindow
    timeWindow: "5 minute", // time window
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
    prefix: prefix,
  });
};

module.exports.options = options;
