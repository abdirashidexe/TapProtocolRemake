const fs = require("fs");
const path = require("path");

const outDir = path.join(process.cwd(), "out");
const marker = path.join(outDir, ".nojekyll");

if (!fs.existsSync(outDir)) {
  console.error("Build output folder not found:", outDir);
  process.exit(1);
}

fs.writeFileSync(marker, "");
console.log("Created", marker);
