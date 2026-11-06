// src/test/phase3a.test.ts
// Phase 3A Functional Verification Tests
// Covers: MP Provenance, Trilingual Localization, Dedicated Tool Routes, Hreflang Tags, History Snapshot Provenance

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { ALL_UNITS, getUnitsForRegion } from "../core/units";
import {
  migrateV1Item,
  type SnapshotProvenance,
} from "../core/history";
import {
  ALL_CORE_ROUTES,
  getHreflangLinks,
  getCoreRouteByPath,
} from "../data/seoRoutes";
import { t } from "../data/translations";

const DIST_DIR = path.resolve(__dirname, "../../dist");

describe("Bharat Land Converter — Phase 3A Verification Tests", () => {
  // 1. MP Provenance Hardening
  describe("1. Madhya Pradesh Regional Evidence Hardening", () => {
    it("P3A-TEST-001: bigha_mp_standard has correct WIDELY_USED_CUSTOMARY classification and no Section 68 claim", () => {
      const mpStandard = ALL_UNITS.find((u) => u.id === "bigha_mp_standard");
      expect(mpStandard).toBeDefined();
      expect(mpStandard?.sqFt).toBe(27225);
      expect(mpStandard?.provenance?.confidence).toBe("WIDELY_USED_CUSTOMARY");
      expect(mpStandard?.provenance?.referenceDocument).not.toContain("Section 68");
      expect(mpStandard?.provenance?.qualification).toContain("customary");
    });

    it("P3A-TEST-002: bigha_mp_gwalior has correct WIDELY_USED_CUSTOMARY classification and 12,000 sq ft factor", () => {
      const mpGwalior = ALL_UNITS.find((u) => u.id === "bigha_mp_gwalior");
      expect(mpGwalior).toBeDefined();
      expect(mpGwalior?.sqFt).toBe(12000);
      expect(mpGwalior?.provenance?.confidence).toBe("WIDELY_USED_CUSTOMARY");
      expect(mpGwalior?.provenance?.referenceDocument).toContain("Gwalior State Land Records");
      expect(mpGwalior?.provenance?.referenceDocument).not.toContain("Section 68");
    });

    it("P3A-TEST-003: MP region returns both standard and gwalior units", () => {
      const mpUnits = getUnitsForRegion("MP");
      const ids = mpUnits.map((u) => u.id);
      expect(ids).toContain("bigha_mp_standard");
      expect(ids).toContain("bigha_mp_gwalior");
    });
  });

  // 2. History Snapshot Provenance & Recovery Integrity
  describe("2. History Migration & Snapshot Provenance", () => {
    it("P3A-TEST-004: Migrates v1 history with VERIFIED_SNAPSHOT when snapshot factors match", () => {
      const v1Item = {
        id: "test-v1-verified",
        timestamp: "2026-03-08T00:00:00.000Z",
        fromValue: 2,
        fromUnitId: "acre",
        fromUnitName: "Acre",
        fromUnitSqFtSnapshot: 43560,
        toValue: 87120,
        toUnitId: "sqft",
        toUnitName: "Square Feet",
        toUnitSqFtSnapshot: 1,
        formattedResult: "87,120",
        stateCode: "MH",
        stateName: "Maharashtra",
      };

      const migrated = migrateV1Item(v1Item);
      expect(migrated.snapshotProvenance).toBe<SnapshotProvenance>("VERIFIED_SNAPSHOT");
      expect(migrated.fromUnitSqFtSnapshot).toBe(43560);
      expect(migrated.toUnitSqFtSnapshot).toBe(1);
    });

    it("P3A-TEST-005: Mathematical recovery calculates accurate factor from stored result", () => {
      // Simulate an un-snapshotted item where stored result was 50,000 sq ft for 2 input units
      const v1Stored = {
        id: "test-v1-custom",
        timestamp: "2026-03-08T00:00:00.000Z",
        fromValue: 2,
        fromUnitId: "custom_village_bigha",
        fromUnitName: "Village Bigha",
        toValue: 50000,
        toUnitId: "sqft",
        toUnitName: "Square Feet",
        formattedResult: "50,000",
        stateCode: "UP",
        stateName: "Uttar Pradesh",
      };

      const migrated = migrateV1Item(v1Stored);
      expect(migrated.snapshotProvenance).toBe<SnapshotProvenance>("RECOVERED_FROM_STORED_RESULT");
      expect(migrated.fromUnitSqFtSnapshot).toBe(25000); // 50000 / 2
      expect(migrated.toUnitSqFtSnapshot).toBe(1);
    });
  });

  // 3. Trilingual Localization
  describe("3. Trilingual System (English, Hindi, Marathi)", () => {
    it("P3A-TEST-006: Translation dictionary covers all required core keys across en, hi, mr", () => {
      const requiredKeys = [
        "appTitle",
        "tagline",
        "selectState",
        "enterValue",
        "fromUnit",
        "toUnit",
        "swapUnits",
        "tabConverter",
        "tabPlot",
        "tabCompound",
        "tabCompare",
        "tabCustom",
        "tabHistory",
      ];

      for (const key of requiredKeys) {
        expect(t(key, "en")).toBeTruthy();
        expect(t(key, "hi")).toBeTruthy();
        expect(t(key, "mr")).toBeTruthy();
      }
    });

    it("P3A-TEST-007: Marathi translations are phonetically and culturally accurate for Maharashtra revenue context", () => {
      expect(t("appTitle", "mr")).toBe("भारत जमीन मोजणी व रूपांतरक");
      expect(t("tabPlot", "mr")).toBe("प्लॉट आकारमान");
      expect(t("tabCompound", "mr")).toBe("मिश्र एकके");
    });
  });

  // 4. Dedicated Tool Routes Metadata
  describe("4. Standalone Tool Pages Metadata", () => {
    it("P3A-TEST-008: All 5 English tool routes are registered in ALL_CORE_ROUTES", () => {
      const toolPaths = [
        "/tools",
        "/tools/plot-area-calculator",
        "/tools/compound-land-unit-converter",
        "/tools/land-unit-comparison",
        "/tools/custom-land-unit-calculator",
      ];

      for (const p of toolPaths) {
        const route = getCoreRouteByPath(p);
        expect(route, `Missing route for ${p}`).toBeDefined();
        expect(route?.canonical).toBe(`https://land.ladestack.in${p}`);
        expect(route?.title).toContain("Bharat Land Converter");
        expect(route?.h1).toBeTruthy();
        expect(route?.description).toBeTruthy();
        expect(route?.breadcrumbs.length).toBeGreaterThanOrEqual(2);
      }
    });

    it("P3A-TEST-009: All 6 Hindi routes are registered in ALL_CORE_ROUTES", () => {
      const hindiPaths = [
        "/hi",
        "/hi/tools",
        "/hi/tools/plot-area-calculator",
        "/hi/tools/compound-land-unit-converter",
        "/hi/tools/land-unit-comparison",
        "/hi/tools/custom-land-unit-calculator",
      ];

      for (const p of hindiPaths) {
        const route = getCoreRouteByPath(p);
        expect(route, `Missing route for ${p}`).toBeDefined();
        expect(route?.canonical).toBe(`https://land.ladestack.in${p}`);
        expect(route?.title).toMatch(/परिवर्तक|कन्वर्टर|कैलकुलेटर|कनवर्टर/);
      }
    });

    it("P3A-TEST-010: All 6 Marathi routes are registered in ALL_CORE_ROUTES", () => {
      const marathiPaths = [
        "/mr",
        "/mr/tools",
        "/mr/tools/plot-area-calculator",
        "/mr/tools/compound-land-unit-converter",
        "/mr/tools/land-unit-comparison",
        "/mr/tools/custom-land-unit-calculator",
      ];

      for (const p of marathiPaths) {
        const route = getCoreRouteByPath(p);
        expect(route, `Missing route for ${p}`).toBeDefined();
        expect(route?.canonical).toBe(`https://land.ladestack.in${p}`);
        expect(route?.title).toMatch(/परिवर्तक|कन्व्हर्टर|कॅल्क्युलेटर/);
      }
    });
  });

  // 5. Hreflang Reciprocal Tags
  describe("5. Reciprocal Hreflang Tag Generation", () => {
    it("P3A-TEST-011: getHreflangLinks generates valid en-IN, hi-IN, mr-IN, and x-default for Home", () => {
      const links = getHreflangLinks("/");
      expect(links).toHaveLength(4);

      const en = links.find((l) => l.hreflang === "en-IN");
      const hi = links.find((l) => l.hreflang === "hi-IN");
      const mr = links.find((l) => l.hreflang === "mr-IN");
      const xDefault = links.find((l) => l.hreflang === "x-default");

      expect(en?.href).toBe("https://land.ladestack.in/");
      expect(hi?.href).toBe("https://land.ladestack.in/hi");
      expect(mr?.href).toBe("https://land.ladestack.in/mr");
      expect(xDefault?.href).toBe("https://land.ladestack.in/");
    });

    it("P3A-TEST-012: getHreflangLinks generates reciprocal links for Plot Area Calculator across en, hi, mr", () => {
      const linksEn = getHreflangLinks("/tools/plot-area-calculator");
      const linksHi = getHreflangLinks("/hi/tools/plot-area-calculator");
      const linksMr = getHreflangLinks("/mr/tools/plot-area-calculator");

      expect(linksEn).toEqual(linksHi);
      expect(linksHi).toEqual(linksMr);

      expect(linksEn.find((l) => l.hreflang === "en-IN")?.href).toBe(
        "https://land.ladestack.in/tools/plot-area-calculator"
      );
      expect(linksEn.find((l) => l.hreflang === "hi-IN")?.href).toBe(
        "https://land.ladestack.in/hi/tools/plot-area-calculator"
      );
      expect(linksEn.find((l) => l.hreflang === "mr-IN")?.href).toBe(
        "https://land.ladestack.in/mr/tools/plot-area-calculator"
      );
      expect(linksEn.find((l) => l.hreflang === "x-default")?.href).toBe(
        "https://land.ladestack.in/tools/plot-area-calculator"
      );
    });
  });

  // 6. Prerendered HTML Quality Validation
  describe("6. Prerendered Static HTML Quality Verification", () => {
    it("P3A-TEST-013: Localized pages have correct html lang attribute", () => {
      const hiHtml = fs.readFileSync(path.join(DIST_DIR, "hi/index.html"), "utf8");
      expect(hiHtml).toMatch(/<html[^>]*lang="hi"/i);

      const mrHtml = fs.readFileSync(path.join(DIST_DIR, "mr/index.html"), "utf8");
      expect(mrHtml).toMatch(/<html[^>]*lang="mr"/i);

      const enHtml = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf8");
      expect(enHtml).toMatch(/<html[^>]*lang="en"/i);
    });

    it("P3A-TEST-014: Tool pages contain rendered DOM elements, breadcrumbs, and JSON-LD schema", () => {
      const plotHtml = fs.readFileSync(path.join(DIST_DIR, "tools/plot-area-calculator/index.html"), "utf8");
      expect(plotHtml).toContain("Plot Area Calculator (Rectangular Land Dimensions)");
      expect(plotHtml).toContain("Area (sq ft) = Length (ft) × Width (ft)");
      expect(plotHtml).toContain("WebApplication");
      expect(plotHtml).toContain("BreadcrumbList");
      expect(plotHtml).toContain('hreflang="en-IN"');
      expect(plotHtml).toContain('hreflang="hi-IN"');
      expect(plotHtml).toContain('hreflang="mr-IN"');
    });

    it("P3A-TEST-015: Total prerendered HTML files count is 32 (31 indexable canonical + 1 404)", () => {
      const expectedPaths = [
        "index.html",
        "about/index.html",
        "faq/index.html",
        "contact/index.html",
        "privacy/index.html",
        "terms/index.html",
        "404.html",
        "tools/index.html",
        "tools/plot-area-calculator/index.html",
        "tools/compound-land-unit-converter/index.html",
        "tools/land-unit-comparison/index.html",
        "tools/custom-land-unit-calculator/index.html",
        "hi/index.html",
        "hi/tools/index.html",
        "hi/tools/plot-area-calculator/index.html",
        "hi/tools/compound-land-unit-converter/index.html",
        "hi/tools/land-unit-comparison/index.html",
        "hi/tools/custom-land-unit-calculator/index.html",
        "mr/index.html",
        "mr/tools/index.html",
        "mr/tools/plot-area-calculator/index.html",
        "mr/tools/compound-land-unit-converter/index.html",
        "mr/tools/land-unit-comparison/index.html",
        "mr/tools/custom-land-unit-calculator/index.html",
        "convert/acre-to-sqft/index.html",
        "convert/hectare-to-acre/index.html",
        "convert/acre-to-guntha/maharashtra/index.html",
        "convert/guntha-to-sqft/maharashtra/index.html",
        "convert/kanal-to-marla/punjab/index.html",
        "convert/ground-to-sqft/tamil-nadu/index.html",
        "convert/acre-to-bigha/uttar-pradesh/index.html",
        "convert/bigha-to-kattha/west-bengal/index.html",
      ];

      for (const p of expectedPaths) {
        const fullPath = path.join(DIST_DIR, p);
        expect(fs.existsSync(fullPath), `Expected prerendered file ${p} does not exist`).toBe(true);
        expect(fs.statSync(fullPath).size).toBeGreaterThan(1000);
      }
    });
  });
});
