const pino = require("pino");
const dayjs = require("dayjs");

const levels = {
  http: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  customLevels: levels,
  useOnlyCustomLevels: true,
  timestamp: () => `,"time":"${dayjs().format()}"`,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
    bindings: (bindings) => {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
        service: process.env.SERVICE_NAME || "wadi-service",
      };
    },
  },
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

module.exports = logger;
