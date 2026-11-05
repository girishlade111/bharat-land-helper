import fs from "fs";
import { spawn } from "child_process";

// Copy index.html to acre-to-sqft.html
fs.copyFileSync("dist/convert/acre-to-sqft/index.html", "dist/convert/acre-to-sqft.html");

const preview = spawn("npx", ["vite", "preview", "--port", "4173"], { shell: true, stdio: "ignore" });
await new Promise(r => setTimeout(r, 2000));

try {
  const r1 = await fetch("http://127.0.0.1:4173/convert/acre-to-sqft");
  const t1 = await r1.text();
  console.log("No slash with .html sibling: Has H1?", t1.includes("Convert Acre to Square Feet (sq ft)"), "Status:", r1.status);
} finally {
  preview.kill();
  fs.unlinkSync("dist/convert/acre-to-sqft.html");
}
