// eslint-disable-next-line @typescript-eslint/no-var-requires
const pino = require("pino");

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: isProduction ? { pid: process.pid } : undefined,
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
});
