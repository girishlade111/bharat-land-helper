// scripts/generate-sitemap.mjs
// Deterministic XML Sitemap Generator for Bharat Land Converter
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const DOMAIN = "https://bharatlandconverter.in";

// 6 Core Canonical Routes (404 is excluded because it is noindex/error)
const CORE_CANONICAL_PATHS = [
  "",
  "about",
  "faq",
  "contact",
  "privacy",
  "terms",
];

// 8 Verified Conversion Landing Pages
const CONVERSION_CANONICAL_PATHS = [
  "convert/acre-to-sqft",
  "convert/hectare-to-acre",
  "convert/acre-to-guntha/maharashtra",
  "convert/guntha-to-sqft/maharashtra",
  "convert/kanal-to-marla/punjab",
  "convert/ground-to-sqft/tamil-nadu",
  "convert/acre-to-bigha/uttar-pradesh",
  "convert/bigha-to-kattha/west-bengal",
];

export function generateSitemapXml() {
  const allPaths = [...CORE_CANONICAL_PATHS, ...CONVERSION_CANONICAL_PATHS];

  const urlsXml = allPaths
    .map((p) => {
      const loc = p === "" ? `${DOMAIN}/` : `${DOMAIN}/${p}`;
      return `  <url>
    <loc>${loc}</loc>
    <changefreq>${p === "" ? "daily" : "monthly"}</changefreq>
    <priority>${p === "" ? "1.0" : p.startsWith("convert/") ? "0.9" : "0.7"}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>
`;
}

export function writeSitemap() {
  const xml = generateSitemapXml();
  const publicPath = path.join(ROOT_DIR, "public", "sitemap.xml");
  fs.writeFileSync(publicPath, xml, "utf8");
  console.log(`Generated deterministic sitemap at ${publicPath} with 14 canonical URLs`);

  // Also write to dist/sitemap.xml if dist exists
  const distPath = path.join(ROOT_DIR, "dist", "sitemap.xml");
  if (fs.existsSync(path.join(ROOT_DIR, "dist"))) {
    fs.writeFileSync(distPath, xml, "utf8");
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeSitemap();
}

