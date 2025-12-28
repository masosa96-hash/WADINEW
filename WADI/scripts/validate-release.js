const { execSync } = require("child_process");
const fs = require("fs");

console.log("🚀 Starting WADI Quality Gate...");

const run = (cmd, desc) => {
  console.log(`\n👉 ${desc}...`);
  try {
    execSync(cmd, { stdio: "inherit" });
    console.log(`✅ ${desc} Passed.`);
  } catch (e) {
    console.error(`❌ ${desc} FAILED.`);
    process.exit(1);
  }
};

// 1. Structure Check
if (!fs.existsSync("pnpm-workspace.yaml")) {
  console.error("❌ Not in root workspace.");
  process.exit(1);
}

// 2. Linting
run("pnpm lint", "Linting & Static Analysis");

// 3. Testing
run("node packages/logger/test-logger.js", "Logger Validation");
run("pnpm --filter kivo test", "Kivo Tests");

// 4. Build Check (Frontend + common packages)
run("pnpm --filter frontend build", "Frontend Build");
run("pnpm --filter kivo build", "Kivo Build Verification");

console.log("\n🎉 ALL CHECKS PASSED. SYSTEM READY FOR RELEASE.");
