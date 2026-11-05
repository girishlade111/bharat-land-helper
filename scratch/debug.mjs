import fs from "fs";

const html = fs.readFileSync("dist/convert/acre-to-sqft/index.html", "utf8");
console.log("File exists! Size:", html.length);
console.log("Has H1:", html.includes("Convert Acre to Square Feet (sq ft)"));
console.log("Canonical line:", html.match(/<link\s+rel="canonical"[^>]+>/)?.[0]);
