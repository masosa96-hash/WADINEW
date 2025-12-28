#!/usr/bin/env node
const { explain } = require("./commands/explain");
const { deploy } = require("./commands/deploy");
const { docs } = require("./commands/docs");
const { lint } = require("./commands/lint");

const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case "explain":
    explain(arg);
    break;
  case "deploy":
    deploy();
    break;
  case "docs":
    docs();
    break;
  case "lint":
    lint();
    break;
  default:
    console.log("Comando no reconocido.");
    console.log("Uso: node cli/index.js [explain|deploy|docs|lint]");
}
