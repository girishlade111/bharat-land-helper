// scripts/prerender.mjs
// Static Prerendering Engine for Bharat Land Converter
// Pre-renders full raw HTML for all core routes and conversion landing pages

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { writeSitemap } from "./generate-sitemap.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const SSR_DIR = path.join(ROOT_DIR, "dist-ssr");

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function main() {
  console.log("==================================================");
  console.log("BHARAT LAND CONVERTER — STATIC PRERENDERING ENGINE");
  console.log("==================================================");

  // 1. Verify client build output exists
  const templatePath = path.join(DIST_DIR, "index.html");
  if (!fs.existsSync(templatePath)) {
    throw new Error("dist/index.html not found! Run 'vite build' before prerendering.");
  }
  const baseTemplate = fs.readFileSync(templatePath, "utf8");

  // 2. Build SSR bundle
  console.log("Building SSR bundle with Vite...");
  execSync("npx vite build --ssr src/entry-server.tsx --outDir dist-ssr", {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });

  // 3. Import SSR bundle
  const ssrEntryPath = path.join(SSR_DIR, "entry-server.js");
  const { render } = await import(`file://${ssrEntryPath.replace(/\\/g, "/")}`);

  // 4. Import SEO route definitions from data
  // Read routes from src/data/seoRoutes.ts by importing from SSR bundle or reading definitions
  // Since entry-server imports App which imports seoRoutes, we can get definitions
  // Or we can define/import them directly
  const { ALL_CORE_ROUTES, CONVERSION_ROUTES, getHreflangLinks } = await import(
    `file://${path.join(ROOT_DIR, "src", "data", "seoRoutes.ts").replace(/\\/g, "/")}`
  );

  console.log(`Prerendering ${ALL_CORE_ROUTES.length} core and localized routes and ${CONVERSION_ROUTES.length} conversion landing pages...`);

  const results = [];

  // Helper to inject route metadata into HTML template
  function prepareHtml(template, renderedBody, route) {
    let html = template;

    // Set correct localized html lang attribute
    const langAttr = route.path.startsWith("/hi") ? "hi" : route.path.startsWith("/mr") ? "mr" : "en";
    if (/<html[^>]*lang=/i.test(html)) {
      html = html.replace(/(<html[^>]*lang=")[^"]*(")/i, `$1${langAttr}$2`);
    } else {
      html = html.replace(/<html/i, `<html lang="${langAttr}"`);
    }

    // Inject server-rendered body
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${renderedBody}</div>`
    );

    // Replace Title
    html = html.replace(
      /<title>.*?<\/title>/s,
      `<title>${escapeHtml(route.title)}</title>`
    );
    html = html.replace(
      /<meta\s+name="title"\s+content=".*?"\s*\/?>/i,
      `<meta name="title" content="${escapeHtml(route.title)}" />`
    );

    // Replace Meta Description
    html = html.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(route.description)}" />`
    );

    // Replace Canonical Link
    html = html.replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
      `<link rel="canonical" href="${route.canonical}" />`
    );

    // Replace OpenGraph
    html = html.replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(route.title)}" />`
    );
    html = html.replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(route.description)}" />`
    );
    html = html.replace(
      /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:url" content="${route.canonical}" />`
    );

    // Replace Twitter Card
    html = html.replace(
      /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`
    );
    html = html.replace(
      /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`
    );
    html = html.replace(
      /<meta\s+name="twitter:url"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:url" content="${route.canonical}" />`
    );

    // Inject reciprocal hreflang tags before </head>
    const hreflangLinks = getHreflangLinks(route.path);
    if (hreflangLinks && hreflangLinks.length > 0) {
      const hreflangHtml = hreflangLinks
        .map((h) => `    <link rel="alternate" hreflang="${h.hreflang}" href="${h.href}" />`)
        .join("\n");
      html = html.replace("</head>", `${hreflangHtml}\n  </head>`);
    }

    // Handle noindex if specified (e.g. 404 page)
    if (route.noindex) {
      html = html.replace(
        /<meta\s+name="robots"\s+content=".*?"\s*\/?>/i,
        `<meta name="robots" content="noindex, nofollow" />`
      );
    }

    return html;
  }

  // 5. Prerender Core & Localized Routes
  for (const route of ALL_CORE_ROUTES) {
    try {
      const renderedBody = render(route.path);
      const finalHtml = prepareHtml(baseTemplate, renderedBody, route);

      if (route.path === "/") {
        const dest = path.join(DIST_DIR, "index.html");
        fs.writeFileSync(dest, finalHtml, "utf8");
        results.push({ path: "/", file: "dist/index.html", size: fs.statSync(dest).size, status: "OK" });
      } else if (route.path === "/404") {
        // Write both dist/404.html (for Vercel HTTP 404 handler) and dist/404/index.html
        const dest404 = path.join(DIST_DIR, "404.html");
        fs.writeFileSync(dest404, finalHtml, "utf8");
        const dir404 = path.join(DIST_DIR, "404");
        fs.mkdirSync(dir404, { recursive: true });
        fs.writeFileSync(path.join(dir404, "index.html"), finalHtml, "utf8");
        results.push({ path: "/404", file: "dist/404.html", size: fs.statSync(dest404).size, status: "OK" });
      } else {
        const routeSubdir = path.join(DIST_DIR, route.path.replace(/^\//, ""));
        fs.mkdirSync(routeSubdir, { recursive: true });
        const dest = path.join(routeSubdir, "index.html");
        fs.writeFileSync(dest, finalHtml, "utf8");

        // Also write clean URL sibling file (e.g. dist/about.html) for static clean-URL servers
        const siblingFile = path.join(DIST_DIR, `${route.path.replace(/^\//, "")}.html`);
        fs.writeFileSync(siblingFile, finalHtml, "utf8");

        results.push({ path: route.path, file: `dist${route.path}/index.html`, size: fs.statSync(dest).size, status: "OK" });
      }
    } catch (err) {
      console.error(`Failed to prerender core route: ${route.path}`, err);
      results.push({ path: route.path, status: "FAIL", error: err.message });
    }
  }

  // 6. Prerender Conversion Landing Pages
  for (const route of CONVERSION_ROUTES) {
    try {
      const renderedBody = render(route.path);
      const finalHtml = prepareHtml(baseTemplate, renderedBody, route);

      const routeSubdir = path.join(DIST_DIR, route.path.replace(/^\//, ""));
      fs.mkdirSync(routeSubdir, { recursive: true });
      const dest = path.join(routeSubdir, "index.html");
      fs.writeFileSync(dest, finalHtml, "utf8");

      // Also write clean URL sibling file (e.g. dist/convert/acre-to-sqft.html)
      const siblingFile = path.join(DIST_DIR, `${route.path.replace(/^\//, "")}.html`);
      fs.mkdirSync(path.dirname(siblingFile), { recursive: true });
      fs.writeFileSync(siblingFile, finalHtml, "utf8");

      results.push({ path: route.path, file: `dist${route.path}/index.html`, size: fs.statSync(dest).size, status: "OK" });
    } catch (err) {
      console.error(`Failed to prerender conversion route: ${route.path}`, err);
      results.push({ path: route.path, status: "FAIL", error: err.message });
    }
  }

  // 7. Cleanup SSR build directory
  try {
    fs.rmSync(SSR_DIR, { recursive: true, force: true });
  } catch {}

  // 8. Generate and sync sitemaps
  writeSitemap();

  // Print summary
  console.log("\nPrerendering completed successfully:");
  console.table(results);
}

main().catch((err) => {
  console.error("Prerender fatal error:", err);
  process.exit(1);
});
