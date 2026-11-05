import fs from "fs";

if (fs.existsSync("dist/404.html")) {
  const html = fs.readFileSync("dist/404.html", "utf8");
  console.log("dist/404.html H1:", html.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1]);
  console.log("dist/404.html Title:", html.match(/<title>(.*?)<\/title>/)?.[1]);
} else {
  console.log("dist/404.html DOES NOT EXIST!");
}
