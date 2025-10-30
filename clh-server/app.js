"use strict";

const path = require("node:path");
const AutoLoad = require("@fastify/autoload");
const cors = require("@fastify/cors");
const rateLimit = require("@fastify/rate-limit");

// Pass --options via CLI arguments in command to enable these options.
const options = {};

module.exports = async function (fastify, opts) {
  await fastify.register(cors, { origin: "*" });
  await fastify.register(rateLimit, { max: 1000, timeWindow: "5 minute" });

  // Normalize prefix: ensure it starts with '/' but no trailing '/'
  const raw = opts.basePath || process.env.BASE_PATH || "/";
  const normalized = ("/" + raw).replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  const usePrefix = normalized !== "/" ? normalized : undefined;

  if (usePrefix) {
    fastify.register(
      async function (scoped) {
        scoped.register(AutoLoad, {
          dir: path.join(__dirname, "routes"),
          options: { ...opts },
        });
      },
      { prefix: usePrefix }
    );
  } else {
    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "routes"),
      options: { ...opts },
    });
  }
};

module.exports.options = options;
