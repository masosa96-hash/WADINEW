const { exec } = require("child_process");

function lint() {
  console.log("🔍 Ejecutando linter...");
  exec("npx eslint apps/frontend/src/**/*.{ts,tsx}", (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return;
    }
    console.log(stdout || "✅ Todo limpio.");
  });
}

module.exports = { lint };
