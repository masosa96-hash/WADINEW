const logger = require("./index");

console.log("--- Logger Test Start ---"); // eslint-disable-line no-console
logger.info({ context: "test" }, "Testing info log");
logger.warn("Testing warn log");
logger.error(new Error("Test error"), "Testing error log");
console.log("--- Logger Test End ---"); // eslint-disable-line no-console
