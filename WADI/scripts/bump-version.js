const fs = require("fs");
const path = require("path");

const packages = [
  "package.json",
  "apps/Frontend/package.json", // Case sensitivity check? path is usually lowercase
  "apps/frontend/package.json",
  "apps/api/package.json",
  "apps/kivo/package.json",
  "apps/kivo-brain-api/package.json",
  "packages/logger/package.json",
];

const version = "1.0.0";

console.log(`🚀 Bumping all packages to v${version}...`);

packages.forEach((pkgPath) => {
  const fullPath = path.resolve(__dirname, "..", pkgPath);
  if (fs.existsSync(fullPath)) {
    const pkg = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    pkg.version = version;
    fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log(`✅ Updated ${pkgPath}`);
  }
});
