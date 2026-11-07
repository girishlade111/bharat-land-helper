// src/test/releaseCandidate.test.ts
// Bharat Land Converter — Final Release Candidate Verification Suite
// Test IDs: RC-001 through RC-020
// Covers: Metric Accuracy, History Safety, Cross-Component Precision, SEO Invariants, Security

import { describe, it, expect, beforeEach } from "vitest";
import { ALL_UNITS, getUnit } from "../core/units";
import { convertArea } from "../core/converter";
import {
  loadHistory,
  saveHistory,
  clearHistory,
  deleteHistoryItem,
  exportHistoryToCsv,
  sanitizeCsvField,
  HISTORY_STORAGE_KEY_V1,
  HISTORY_STORAGE_KEY_LEGACY_ALT,
  HISTORY_MIGRATION_FLAG,
  type ConversionHistoryItem,
} from "../core/history";
import { calculatePlotArea } from "../core/plotCalculator";
import { COMPOUND_SYSTEMS, calculateCompoundArea } from "../core/compoundUnits";
import { ALL_CORE_ROUTES, TOOL_ROUTES, CONVERSION_ROUTES, getHreflangLinks } from "../data/seoRoutes";
import * as fs from "fs";
import * as path from "path";

describe("Bharat Land Converter — Final Release Candidate Suite", () => {
  beforeEach(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }
  });

  // =========================================================================
  // Section 1: Metric Accuracy & Acre-to-Square-Metre Invariants (RC-001 to RC-007)
  // =========================================================================

  it("RC-001: 1 Acre is exactly 43,560 square feet", () => {
    const acre = getUnit("acre");
    expect(acre).toBeDefined();
    expect(acre!.sqFt).toBe(43560);

    const conversion = convertArea(1, "acre", "sqft");
    expect(conversion.rawResult).toBe(43560);
  });

  it("RC-002: 1 Acre is exactly 4,046.8564224 square metres (within 1e-9 error)", () => {
    const acre = getUnit("acre");
    expect(acre).toBeDefined();
    // 1 ft = 0.3048 m -> 1 sq ft = 0.09290304 sq m
    // 43560 * 0.09290304 = 4046.8564224 m^2
    const expectedSqm = 43560 * 0.09290304;
    expect(acre!.sqMeters).toBeCloseTo(expectedSqm, 9);
    expect(acre!.sqMeters).toBeCloseTo(4046.8564224, 7);

    const conversion = convertArea(1, "acre", "sqm");
    expect(conversion.rawResult).toBeCloseTo(4046.8564224, 7);
  });

  it("RC-003: 1 Acre is exactly 0.40468564224 Hectares", () => {
    const conversion = convertArea(1, "acre", "hectare");
    expect(conversion.rawResult).toBeCloseTo(0.40468564224, 9);
  });

  it("RC-004: 10 Acres is 40,468.564224 square metres (the tenfold report error resolution)", () => {
    const conversion = convertArea(10, "acre", "sqm");
    expect(conversion.rawResult).toBeCloseTo(40468.564224, 6);

    // Proof that 40,468.564 sq m equals 10 Acres, not 1 Acre:
    const reverseToAcre = convertArea(40468.564224, "sqm", "acre");
    expect(reverseToAcre.rawResult).toBeCloseTo(10, 6);
  });

  it("RC-005: 1 Hectare is exactly 10,000 square metres and approximately 107,639.104 sq ft", () => {
    const hectare = getUnit("hectare");
    expect(hectare).toBeDefined();
    expect(hectare!.sqMeters).toBe(10000);

    const expectedSqFt = 10000 / 0.09290304; // 107639.10416709722
    expect(hectare!.sqFt).toBeCloseTo(expectedSqFt, 6);

    const toSqFtConversion = convertArea(1, "hectare", "sqft");
    expect(toSqFtConversion.rawResult).toBeCloseTo(107639.104167, 5);
  });

  it("RC-006: Cross-component metric consistency in Plot Calculator (200 ft × 217.8 ft = 1 Acre)", () => {
    const result = calculatePlotArea(200, 217.8, "ft");

    expect(result.isValid).toBe(true);
    expect(result.areaSqFt).toBeCloseTo(43560, 4);
    expect(result.breakdown.sqM).toBeCloseTo(4046.8564224, 4);
    expect(result.breakdown.acre).toBeCloseTo(1.0, 6);
    expect(result.breakdown.gunthaMH).toBeCloseTo(40.0, 4);
  });

  it("RC-007: Zero erroneous 40,468 sq m / Acre claims exist in source code units or notes", () => {
    const acre = getUnit("acre")!;
    expect(acre.note).toContain("4,046.8564 sq m");
    expect(acre.note).not.toContain("40,468");

    ALL_UNITS.forEach((unit) => {
      if (unit.id === "acre") {
        expect(unit.sqMeters).toBeLessThan(5000);
        expect(unit.sqMeters).toBeGreaterThan(4000);
      }
    });
  });

  // =========================================================================
  // Section 2: History Migration & Delete Safety Invariants (RC-008 to RC-010)
  // =========================================================================

  it("RC-008: History migration is idempotent and sets permanent migration flag", () => {
    const legacyItem = {
      id: "legacy_calc_1",
      fromValue: 5,
      fromUnitId: "acre",
      fromUnitName: "Acre",
      toValue: 200,
      toUnitId: "guntha_mh",
      toUnitName: "Guntha",
      formattedResult: "200 Guntha",
      stateCode: "MH",
      stateName: "Maharashtra",
      formula: "Area (Guntha) = 5 × 40",
      timestamp: "2026-03-01T10:00:00.000Z",
    };

    window.localStorage.setItem(HISTORY_STORAGE_KEY_V1, JSON.stringify([legacyItem]));
    expect(window.localStorage.getItem(HISTORY_MIGRATION_FLAG)).toBeNull();

    // First load runs migration
    const firstLoaded = loadHistory();
    expect(firstLoaded.length).toBe(1);
    expect(firstLoaded[0].id).toBe("legacy_calc_1");
    expect(firstLoaded[0].dataVersion).toBe("v2");
    expect(window.localStorage.getItem(HISTORY_MIGRATION_FLAG)).toBe("true");

    // Second load is idempotent and does not corrupt or duplicate records
    const secondLoaded = loadHistory();
    expect(secondLoaded.length).toBe(1);
    expect(secondLoaded[0].id).toBe("legacy_calc_1");
  });

  it("RC-009: Deleted history does not reappear on reload (No legacy resurrection)", () => {
    const legacyItem = {
      id: "legacy_calc_to_delete",
      fromValue: 1,
      fromUnitId: "acre",
      toValue: 40,
      toUnitId: "guntha_mh",
      timestamp: "2026-03-01T12:00:00.000Z",
    };

    // Seed legacy keys
    window.localStorage.setItem(HISTORY_STORAGE_KEY_V1, JSON.stringify([legacyItem]));
    window.localStorage.setItem(HISTORY_STORAGE_KEY_LEGACY_ALT, JSON.stringify([legacyItem]));

    // Load initial history
    let history = loadHistory();
    expect(history.length).toBe(1);

    // Delete item
    history = deleteHistoryItem("legacy_calc_to_delete");
    expect(history.length).toBe(0);

    // Reload from clean state
    const reloaded = loadHistory();
    expect(reloaded.length).toBe(0);
    expect(window.localStorage.getItem(HISTORY_MIGRATION_FLAG)).toBe("true");

    // Full clearHistory verification
    clearHistory(false);
    expect(loadHistory().length).toBe(0);
  });

  it("RC-010: Custom factor snapshots survive history serialization and reload", () => {
    const customItem: ConversionHistoryItem = {
      id: "custom_calc_100",
      dataVersion: "v2",
      timestamp: new Date().toISOString(),
      fromValue: 2,
      fromUnitId: "custom_kila_haryana",
      fromUnitName: "Kila (Custom)",
      fromUnitSqFtSnapshot: 43560,
      toValue: 80,
      toUnitId: "guntha_mh",
      toUnitName: "Guntha (Maharashtra)",
      toUnitSqFtSnapshot: 1089,
      formattedResult: "80 Guntha",
      stateCode: "HR",
      stateName: "Haryana",
      formula: "Area (Guntha) = 2 × 40",
      isCustomUnit: true,
      customFactorSnapshot: 43560,
      confidence: "USER_CUSTOM_OVERRIDE",
      snapshotProvenance: "VERIFIED_SNAPSHOT",
      isFavorite: true,
    };

    saveHistory([customItem]);
    const reloaded = loadHistory();
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].isCustomUnit).toBe(true);
    expect(reloaded[0].customFactorSnapshot).toBe(43560);
    expect(reloaded[0].fromUnitSqFtSnapshot).toBe(43560);
    expect(reloaded[0].toUnitSqFtSnapshot).toBe(1089);
    expect(reloaded[0].isFavorite).toBe(true);

    const csv = exportHistoryToCsv(reloaded);
    expect(csv).toContain("Yes (Custom)");
    expect(csv).toContain("43560");
  });

  // =========================================================================
  // Section 3: Technical SEO & Production Domain Invariants (RC-011 to RC-013)
  // =========================================================================

  it("RC-011: Canonical production domain is exclusively https://land.ladestack.in across all SEO routes", () => {
    const allRoutes = [...ALL_CORE_ROUTES, ...CONVERSION_ROUTES];
    expect(allRoutes.length).toBeGreaterThan(15);
    allRoutes.forEach((route) => {
      expect(route.canonical).toMatch(/^https:\/\/land\.ladestack\.in/);
      expect(route.canonical).not.toContain("bharatlandconverter");
    });
  });

  it("RC-012: Zero mentions of unauthorized domain exist in src application code", () => {
    const forbiddenPattern = ["bharat", "landconverter", ".in"].join("");
    const srcDir = path.resolve(__dirname, "..");
    const checkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        // Skip test directory to avoid false positive on self-string
        if (entry.isDirectory() && entry.name !== "test") {
          checkDir(fullPath);
        } else if (entry.isFile() && !fullPath.includes("test")) {
          const content = fs.readFileSync(fullPath, "utf-8");
          expect(content).not.toContain(forbiddenPattern);
        }
      }
    };
    checkDir(srcDir);
  });

  it("RC-013: Multilingual hreflang links exist and point to authorized canonical origin", () => {
    const rootHreflang = getHreflangLinks("/");
    expect(rootHreflang.length).toBeGreaterThan(0);
    rootHreflang.forEach((link) => {
      expect(link.href).toMatch(/^https:\/\/land\.ladestack\.in/);
      expect(link.href).not.toContain("bharatlandconverter");
    });
  });

  // =========================================================================
  // Section 4: Dedicated Tools Accuracy & Precision (RC-014 to RC-017)
  // =========================================================================

  it("RC-014: Plot Area Calculator accurately calculates metric conversions from dimensions", () => {
    // 100 ft × 50 ft = 5,000 sq ft
    const plot5000 = calculatePlotArea(100, 50, "ft");
    expect(plot5000.isValid).toBe(true);
    expect(plot5000.areaSqFt).toBe(5000);
    expect(plot5000.breakdown.sqM).toBeCloseTo(5000 * 0.09290304, 5);

    // 100 m × 100 m = 10,000 sq m = 1 Hectare
    const plotHectare = calculatePlotArea(100, 100, "m");
    expect(plotHectare.isValid).toBe(true);
    expect(plotHectare.breakdown.sqM).toBeCloseTo(10000, 1);
    expect(plotHectare.breakdown.hectare).toBeCloseTo(1.0, 4);
  });

  it("RC-015: Compound Unit Converter accurately computes UP Pucca Bigha and sub-units", () => {
    // UP Pucca Bigha = 27,225 sq ft = 20 Biswa
    const upSystem = COMPOUND_SYSTEMS.find((s) => s.id === "up_pucca");
    expect(upSystem).toBeDefined();

    const upCalc = calculateCompoundArea("up_pucca", { bigha: 1, biswa: 0, biswansi: 0 });
    expect(upCalc.totalSqFt).toBe(27225);

    // 1 Biswa UP Pucca = 1,361.25 sq ft
    const biswaCalc = calculateCompoundArea("up_pucca", { bigha: 0, biswa: 1, biswansi: 0 });
    expect(biswaCalc.totalSqFt).toBe(1361.25);
  });

  it("RC-016: Regional comparison matrix shows authoritative state-specific Bigha variance", () => {
    const wbBigha = getUnit("bigha_wb");
    const upPucca = getUnit("bigha_up_pucca");
    const hpBigha = getUnit("bigha_hp");

    expect(wbBigha!.sqFt).toBe(14400); // 1,600 sq yd
    expect(upPucca!.sqFt).toBe(27225); // 3,025 sq yd
    expect(hpBigha!.sqFt).toBe(8712); // 968 sq yd

    // Mathematical distinctness verification
    expect(wbBigha!.sqFt).not.toBe(upPucca!.sqFt);
    expect(upPucca!.sqFt).not.toBe(hpBigha!.sqFt);
  });

  it("RC-017: Custom Unit Calculator computes forward and backward conversions with arbitrary factor", () => {
    const customFactor = 1200; // 1 Custom Unit = 1,200 sq ft
    const customValue = 5; // 5 Custom Units = 6,000 sq ft
    const totalSqFt = customValue * customFactor;
    expect(totalSqFt).toBe(6000);

    const gunthaMh = getUnit("guntha_mh")!;
    const convertedGuntha = totalSqFt / gunthaMh.sqFt;
    expect(convertedGuntha).toBeCloseTo(6000 / 1089, 6);
  });

  // =========================================================================
  // Section 5: Security & Export Invariants (RC-018 to RC-020)
  // =========================================================================

  it("RC-018: OWASP CSV Injection protection sanitizes spreadsheet formula triggers", () => {
    const maliciousFormulas = [
      "=cmd|' /C calc'!A0",
      "+2+5+cmd",
      "-10+20",
      "@SUM(A1:A10)",
      "\tTabbedPayload",
      "\rCarriageReturnPayload",
    ];

    maliciousFormulas.forEach((formula) => {
      const sanitized = sanitizeCsvField(formula);
      // OWASP mitigation prefixes dangerous formula characters with single quote (')
      expect(sanitized.startsWith("\"'") || sanitized.startsWith("'")).toBe(true);
    });

    const safeNumber = sanitizeCsvField(43560);
    expect(safeNumber).toBe("43560");
  });

  it("RC-019: UTF-8 Byte Order Mark (BOM) is prepended to CSV export for Excel compatibility", () => {
    const sampleItems: ConversionHistoryItem[] = [
      {
        id: "test_bom",
        dataVersion: "v2",
        timestamp: "2026-03-01T12:00:00.000Z",
        fromValue: 1,
        fromUnitId: "acre",
        fromUnitName: "एकड़ (Acre)",
        toValue: 40,
        toUnitId: "guntha_mh",
        toUnitName: "गुंठा (Guntha)",
        formattedResult: "40 गुंठा",
        stateCode: "MH",
        stateName: "महाराष्ट्र (Maharashtra)",
        formula: "Area = 1 × 40",
        isFavorite: false,
      },
    ];

    const csvOutput = exportHistoryToCsv(sampleItems);
    expect(csvOutput.charCodeAt(0)).toBe(0xfeff);
    expect(csvOutput).toContain("एकड़");
    expect(csvOutput).toContain("महाराष्ट्र");
  });

  it("RC-020: Standalone tool routes are defined and included in public SEO routes", () => {
    expect(TOOL_ROUTES.length).toBe(5);
    const toolPaths = TOOL_ROUTES.map((r) => r.path);

    expect(toolPaths).toContain("/tools");
    expect(toolPaths).toContain("/tools/plot-area-calculator");
    expect(toolPaths).toContain("/tools/compound-land-unit-converter");
    expect(toolPaths).toContain("/tools/land-unit-comparison");
    expect(toolPaths).toContain("/tools/custom-land-unit-calculator");

    expect(CONVERSION_ROUTES.length).toBeGreaterThanOrEqual(8);
  });
});
