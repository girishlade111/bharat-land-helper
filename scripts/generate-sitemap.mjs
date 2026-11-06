// scripts/generate-sitemap.mjs
// Deterministic XML Sitemap Generator for Bharat Land Converter
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

import { SITE_URL } from "../src/config/site.ts";

const DOMAIN = SITE_URL;

// 6 Core Canonical Routes (404 is excluded because it is noindex/error)
export const CORE_CANONICAL_PATHS = [
  "",
  "about",
  "faq",
  "contact",
  "privacy",
  "terms",
];

// 5 Dedicated Standalone Tool Routes
export const TOOL_CANONICAL_PATHS = [
  "tools",
  "tools/plot-area-calculator",
  "tools/compound-land-unit-converter",
  "tools/land-unit-comparison",
  "tools/custom-land-unit-calculator",
];

// 6 Hindi Localized Routes
export const HINDI_CANONICAL_PATHS = [
  "hi",
  "hi/tools",
  "hi/tools/plot-area-calculator",
  "hi/tools/compound-land-unit-converter",
  "hi/tools/land-unit-comparison",
  "hi/tools/custom-land-unit-calculator",
];

// 6 Marathi Localized Routes
export const MARATHI_CANONICAL_PATHS = [
  "mr",
  "mr/tools",
  "mr/tools/plot-area-calculator",
  "mr/tools/compound-land-unit-converter",
  "mr/tools/land-unit-comparison",
  "mr/tools/custom-land-unit-calculator",
];

// 8 Verified Conversion Landing Pages
export const CONVERSION_CANONICAL_PATHS = [
  "convert/acre-to-sqft",
  "convert/hectare-to-acre",
  "convert/acre-to-guntha/maharashtra",
  "convert/guntha-to-sqft/maharashtra",
  "convert/kanal-to-marla/punjab",
  "convert/ground-to-sqft/tamil-nadu",
  "convert/acre-to-bigha/uttar-pradesh",
  "convert/bigha-to-kattha/west-bengal",
];

export const ALL_CANONICAL_PATHS = [
  ...CORE_CANONICAL_PATHS,
  ...TOOL_CANONICAL_PATHS,
  ...HINDI_CANONICAL_PATHS,
  ...MARATHI_CANONICAL_PATHS,
  ...CONVERSION_CANONICAL_PATHS,
];

export function generateSitemapXml() {
  const urlsXml = ALL_CANONICAL_PATHS
    .map((p) => {
      const loc = p === "" ? `${DOMAIN}/` : `${DOMAIN}/${p}`;
      const isHome = p === "" || p === "hi" || p === "mr";
      const isTool = p.includes("tools");
      const isConvert = p.startsWith("convert/");
      const priority = isHome ? "1.0" : isTool ? "0.9" : isConvert ? "0.8" : "0.7";
      const changefreq = isHome ? "daily" : isTool || isConvert ? "weekly" : "monthly";

      return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
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
  console.log(`Generated deterministic sitemap at ${publicPath} with ${ALL_CANONICAL_PATHS.length} canonical URLs`);

  // Also write to dist/sitemap.xml if dist exists
  const distPath = path.join(ROOT_DIR, "dist", "sitemap.xml");
  if (fs.existsSync(path.join(ROOT_DIR, "dist"))) {
    fs.writeFileSync(distPath, xml, "utf8");
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeSitemap();
}
