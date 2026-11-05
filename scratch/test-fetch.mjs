import { spawn } from "child_process";

const preview = spawn("npx", ["vite", "preview", "--port", "4173"], { shell: true, stdio: "ignore" });

await new Promise(r => setTimeout(r, 2000));

try {
  const r1 = await fetch("http://127.0.0.1:4173/convert/acre-to-sqft");
  const t1 = await r1.text();
  console.log("No slash: Has H1?", t1.includes("Convert Acre to Square Feet (sq ft)"), "Status:", r1.status);

  const r2 = await fetch("http://127.0.0.1:4173/convert/acre-to-sqft/");
  const t2 = await r2.text();
  console.log("With slash: Has H1?", t2.includes("Convert Acre to Square Feet (sq ft)"), "Status:", r2.status);
} finally {
  preview.kill();
}
