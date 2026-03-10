"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// eslint-disable-next-line @typescript-eslint/no-var-requires
var pino = require("pino");
var isProduction = process.env.NODE_ENV === "production";
exports.logger = pino({
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
