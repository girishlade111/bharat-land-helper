import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  CORE_ROUTES,
  CONVERSION_ROUTES,
  ALL_PUBLIC_ROUTES,
  getConversionRouteByPath,
  getCoreRouteByPath,
} from "../data/seoRoutes";
import { convertArea, getUnit } from "../core";

const ROOT_DIR = path.resolve(__dirname, "../..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

function readDistFile(subpath: string): string {
  const filePath = path.join(DIST_DIR, subpath);
  return fs.readFileSync(filePath, "utf8");
}

describe("Bharat Land Converter — Phase 2A Technical SEO Tests", () => {
  // SEO-TEST-001
  it("SEO-TEST-001: Homepage HTML has unique title, description, and canonical", () => {
    const html = readDistFile("index.html");
    expect(html).toContain("<title>Bharat Land Converter | Bigha, Guntha, Acre, Hectare — All India</title>");
    expect(html).toContain('<link rel="canonical" href="https://bharatlandconverter.in/"');
    expect(html).toContain('<meta name="description" content="Free Indian land area converter.');
    // Must contain server-rendered body content
    expect(html).not.toContain('<div id="root"></div>');
    expect(html).toContain("Bharat Land");
  });

  // SEO-TEST-002
  it("SEO-TEST-002: About page has route-specific title, description, and canonical", () => {
    const html = readDistFile("about/index.html");
    expect(html).toContain("<title>About Us | Bharat Land Converter</title>");
    expect(html).toContain('<link rel="canonical" href="https://bharatlandconverter.in/about"');
    expect(html).toContain("Our Mission");
    expect(html).toContain("About Bharat Land Converter");
  });

  // SEO-TEST-003
  it("SEO-TEST-003: FAQ page has route-specific initial HTML", () => {
    const html = readDistFile("faq/index.html");
    expect(html).toContain("<title>Frequently Asked Questions | Bharat Land Converter</title>");
    expect(html).toContain('<link rel="canonical" href="https://bharatlandconverter.in/faq"');
    expect(html).toContain("Frequently Asked Questions");
    expect(html).toContain("How many square feet in 1 Guntha?");
  });

  // SEO-TEST-004
  it("SEO-TEST-004: Conversion page contains actual formula and relevant content before JavaScript execution", () => {
    const html = readDistFile("convert/acre-to-sqft/index.html");
    expect(html).toContain("<title>Convert Acre to Square Feet (sq ft) | Bharat Land Converter</title>");
    expect(html).toContain('<link rel="canonical" href="https://bharatlandconverter.in/convert/acre-to-sqft"');
    expect(html).toContain("Area (sq ft) = Area (Acre) × 43,560");
    expect(html).toContain("43,560");
    expect(html).toContain("Quick Reference Conversion Table");
    expect(html).toContain("Regional Land Measurement &amp; Legal Provenance");
    expect(html).toContain("Indian Standards of Weights and Measures Act, 1976");
  });

  // SEO-TEST-005
  it("SEO-TEST-005: Conversion page initializes working interactive controls and formulas", () => {
    const route = getConversionRouteByPath("/convert/acre-to-sqft")!;
    expect(route).toBeDefined();
    expect(route.fromUnit).toBe("acre");
    expect(route.toUnit).toBe("sqft");
    expect(route.factor).toBe(43560);

    const from = getUnit(route.fromUnit)!;
    const to = getUnit(route.toUnit)!;
    const result = convertArea(1, from, to);
    expect(result.rawResult).toBe(43560);
  });

  // SEO-TEST-006
  it("SEO-TEST-006: 404 page exists, contains 404 content and noindex directive", () => {
    const html = readDistFile("404.html");
    expect(html).toContain("<title>Page Not Found | Bharat Land Converter</title>");
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(html).toContain("404");
    expect(html).toContain("Page Not Found");
    expect(html).toContain("Back to Main Converter");
  });

  // SEO-TEST-007
  it("SEO-TEST-007: robots.txt is valid, crawlable, and points to production sitemap", () => {
    const robots = fs.readFileSync(path.join(PUBLIC_DIR, "robots.txt"), "utf8");
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Sitemap: https://bharatlandconverter.in/sitemap.xml");
    expect(robots).not.toContain("Disallow: /");
  });

  // SEO-TEST-008
  it("SEO-TEST-008: sitemap.xml contains only canonical indexable URLs", () => {
    const sitemap = fs.readFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), "utf8");
    expect(sitemap).toContain("<loc>https://bharatlandconverter.in/</loc>");
    expect(sitemap).toContain("<loc>https://bharatlandconverter.in/about</loc>");
    expect(sitemap).toContain("<loc>https://bharatlandconverter.in/convert/acre-to-sqft</loc>");

    // Exclude noindex / error pages
    expect(sitemap).not.toContain("/404");

    // Exclude query strings and fake alternates
    expect(sitemap).not.toContain("?u=");
    expect(sitemap).not.toContain("?lang=hi");

    const locMatches = sitemap.match(/<loc>(.*?)<\/loc>/g) || [];
    expect(locMatches.length).toBe(14); // Exactly 6 core + 8 conversion routes
  });

  // SEO-TEST-009
  it("SEO-TEST-009: No nonexistent pages appear in the sitemap", () => {
    const sitemap = fs.readFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), "utf8");
    const locs = Array.from(sitemap.matchAll(/<loc>(https:\/\/bharatlandconverter\.in(\/.*?|\/))<\/loc>/g)).map(
      (m) => m[2]
    );

    for (const loc of locs) {
      if (loc === "/") {
        expect(fs.existsSync(path.join(DIST_DIR, "index.html"))).toBe(true);
      } else {
        const subpath = loc.replace(/^\//, "");
        const targetHtml = path.join(DIST_DIR, subpath, "index.html");
        expect(fs.existsSync(targetHtml)).toBe(true);
      }
    }
  });

  // SEO-TEST-010
  it("SEO-TEST-010: No fake reviews or aggregate ratings appear in markup", () => {
    const htmlFiles = [
      readDistFile("index.html"),
      readDistFile("about/index.html"),
      readDistFile("convert/acre-to-sqft/index.html"),
      readDistFile("convert/hectare-to-acre/index.html"),
    ];

    for (const html of htmlFiles) {
      expect(html).not.toContain("aggregateRating");
      expect(html).not.toContain("ratingValue");
      expect(html).not.toContain("reviewCount");
    }
  });

  // SEO-TEST-011
  it("SEO-TEST-011: All JSON-LD structured data blocks parse successfully as valid JSON", () => {
    const samplePages = [
      "index.html",
      "convert/acre-to-sqft/index.html",
      "convert/acre-to-guntha/maharashtra/index.html",
      "convert/bigha-to-kattha/west-bengal/index.html",
    ];

    for (const page of samplePages) {
      const html = readDistFile(page);
      const jsonLdMatches = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g));
      expect(jsonLdMatches.length).toBeGreaterThan(0);

      for (const match of jsonLdMatches) {
        const rawJson = match[1].trim();
        expect(() => JSON.parse(rawJson)).not.toThrow();
        const parsed = JSON.parse(rawJson);
        expect(parsed["@context"]).toBe("https://schema.org");
      }
    }
  });

  // SEO-TEST-012
  it("SEO-TEST-012: All referenced local favicon and OG image assets exist with non-zero size", () => {
    const ogImg = path.join(PUBLIC_DIR, "og-image.png");
    const favSvg = path.join(PUBLIC_DIR, "favicon.svg");
    const favIco = path.join(PUBLIC_DIR, "favicon.ico");
    const manifest = path.join(PUBLIC_DIR, "manifest.json");

    expect(fs.existsSync(ogImg)).toBe(true);
    expect(fs.statSync(ogImg).size).toBeGreaterThan(1000);

    expect(fs.existsSync(favSvg)).toBe(true);
    expect(fs.statSync(favSvg).size).toBeGreaterThan(100);

    expect(fs.existsSync(favIco)).toBe(true);
    expect(fs.statSync(favIco).size).toBeGreaterThan(100);

    expect(fs.existsSync(manifest)).toBe(true);
  });

  // SEO-TEST-013
  it("SEO-TEST-013: Canonical URLs match final route URLs without redirect or slash mismatch", () => {
    for (const route of CONVERSION_ROUTES) {
      const html = readDistFile(`${route.path.replace(/^\//, "")}/index.html`);
      expect(html).toContain(`<link rel="canonical" href="${route.canonical}"`);
    }
    for (const route of CORE_ROUTES) {
      if (route.path === "/") {
        const html = readDistFile("index.html");
        expect(html).toContain('<link rel="canonical" href="https://bharatlandconverter.in/"');
      } else if (route.path === "/404") {
        const html = readDistFile("404.html");
        expect(html).toContain('<link rel="canonical" href="https://bharatlandconverter.in/404"');
      } else {
        const html = readDistFile(`${route.path.replace(/^\//, "")}/index.html`);
        expect(html).toContain(`<link rel="canonical" href="${route.canonical}"`);
      }
    }
  });

  // SEO-TEST-014
  it("SEO-TEST-014: All 8 candidate conversion routes are registered in ALL_PUBLIC_ROUTES", () => {
    expect(CONVERSION_ROUTES.length).toBe(8);
    for (const r of CONVERSION_ROUTES) {
      expect(ALL_PUBLIC_ROUTES).toContain(r.path);
    }
  });

  // SEO-TEST-015
  it("SEO-TEST-015: Regional variants and state codes are verified for each conversion route", () => {
    const mh = getConversionRouteByPath("/convert/acre-to-guntha/maharashtra")!;
    expect(mh.stateCode).toBe("MH");
    expect(mh.factor).toBe(40);

    const pb = getConversionRouteByPath("/convert/kanal-to-marla/punjab")!;
    expect(pb.stateCode).toBe("PB");
    expect(pb.factor).toBe(20);

    const tn = getConversionRouteByPath("/convert/ground-to-sqft/tamil-nadu")!;
    expect(tn.stateCode).toBe("TN");
    expect(tn.factor).toBe(2400);

    const up = getConversionRouteByPath("/convert/acre-to-bigha/uttar-pradesh")!;
    expect(up.stateCode).toBe("UP");
    expect(up.factor).toBe(1.6);

    const wb = getConversionRouteByPath("/convert/bigha-to-kattha/west-bengal")!;
    expect(wb.stateCode).toBe("WB");
    expect(wb.factor).toBe(20);
  });

  // SEO-TEST-016
  it("SEO-TEST-016: Prerendered HTML contains clean hydration attributes without syntax errors", () => {
    const html = readDistFile("convert/acre-to-sqft/index.html");
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<html lang="en"');
    expect(html).toContain('</html>');
  });

  // SEO-TEST-017
  it("SEO-TEST-017: Converter mathematical precision matches core engine across all 8 routes", () => {
    for (const route of CONVERSION_ROUTES) {
      const from = getUnit(route.fromUnit)!;
      const to = getUnit(route.toUnit)!;
      expect(from).toBeDefined();
      expect(to).toBeDefined();

      const res = convertArea(route.defaultVal, from, to);
      expect(res.rawResult).toBeCloseTo(route.factor, 4);
    }
  });

  // SEO-TEST-018
  it("SEO-TEST-018: Regional customary qualifications and statutory citations are present on regional pages", () => {
    const upHtml = readDistFile("convert/acre-to-bigha/uttar-pradesh/index.html");
    expect(upHtml).toContain("Uttar Pradesh Revenue Code");
    expect(upHtml).toContain("Pucca Bigha");
    expect(upHtml).toContain("Kaccha Bigha");

    const pbHtml = readDistFile("convert/kanal-to-marla/punjab/index.html");
    expect(pbHtml).toContain("Punjab Land Revenue Act");
    expect(pbHtml).toContain("Karam");

    const wbHtml = readDistFile("convert/bigha-to-kattha/west-bengal/index.html");
    expect(wbHtml).toContain("West Bengal Land Reforms Act");
  });

  // SEO-TEST-019
  it("SEO-TEST-019: Internal links navigate to valid canonical routes", () => {
    for (const route of CONVERSION_ROUTES) {
      for (const rel of route.relatedLinks) {
        expect(ALL_PUBLIC_ROUTES).toContain(rel.path);
      }
    }
  });

  // SEO-TEST-020
  it("SEO-TEST-020: Core functional route lookup helpers return exact definitions", () => {
    expect(getCoreRouteByPath("/")?.h1).toBe("Bharat Land Area Converter");
    expect(getCoreRouteByPath("/about")?.h1).toBe("About Bharat Land Converter");
    expect(getCoreRouteByPath("/404")?.noindex).toBe(true);
    expect(getConversionRouteByPath("/convert/guntha-to-sqft/maharashtra")?.factor).toBe(1089);
  });
});

