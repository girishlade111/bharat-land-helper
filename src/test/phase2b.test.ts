import { describe, it, expect, beforeEach } from "vitest";
import {
  calculatePlotArea,
  LENGTH_UNITS,
  COMPOUND_SYSTEMS,
  calculateCompoundArea,
  decomposeAreaIntoSystem,
  validateCustomUnitInput,
  saveCustomPreset,
  loadCustomPresets,
  deleteCustomPreset,
  addHistoryItem,
  loadHistory,
  clearHistory,
  toggleFavorite,
  deleteHistoryItem,
  exportHistoryToCsv,
} from "../core";
import { COMPARISON_DATA } from "../components/RegionalComparison";

describe("Bharat Land Converter — Phase 2B Advanced Utilities Test Suite", () => {
  beforeEach(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }
  });

  // ==========================================
  // 1. PLOT DIMENSIONS CALCULATOR TESTS
  // ==========================================
  describe("1. Plot Dimensions Calculator Engine", () => {
    it("computes rectangular plot area in feet (50 ft × 30 ft = 1,500 sq ft)", () => {
      const res = calculatePlotArea("50", "30", "ft");
      expect(res.isValid).toBe(true);
      expect(res.areaSqFt).toBe(1500);
      expect(res.perimeter).toBe(160);
      expect(res.perimeterFt).toBe(160);
      expect(res.aspectRatio).toBeCloseTo(1.6667, 3);
      expect(res.breakdown.sqYd).toBeCloseTo(1500 / 9, 3);
      expect(res.breakdown.acre).toBeCloseTo(1500 / 43560, 4);
      expect(res.breakdown.hectare).toBeCloseTo((1500 * 0.09290304) / 10000, 4);
    });

    it("computes rectangular plot area in metres (20 m × 10 m = 200 sq m)", () => {
      const res = calculatePlotArea("20", "10", "m");
      expect(res.isValid).toBe(true);
      expect(res.breakdown.sqM).toBeCloseTo(200, 2);
      expect(res.areaSqFt).toBeCloseTo(200 / 0.09290304, 1);
      expect(res.perimeter).toBe(60); // 60 metres
      expect(res.perimeterFt).toBeCloseTo(60 * 3.28084, 1);
    });

    it("computes rectangular plot area in yards (30 yd × 20 yd = 600 sq yd = 5,400 sq ft)", () => {
      const res = calculatePlotArea("30", "20", "yd");
      expect(res.isValid).toBe(true);
      expect(res.breakdown.sqYd).toBe(600);
      expect(res.areaSqFt).toBe(5400);
      expect(res.perimeter).toBe(100);
    });

    it("computes rectangular plot area in inches (120 in × 60 in = 50 sq ft)", () => {
      const res = calculatePlotArea("120", "60", "in");
      expect(res.isValid).toBe(true);
      expect(res.areaSqFt).toBe(50);
      expect(res.perimeter).toBe(360);
    });

    it("rejects invalid, zero, or negative dimensions", () => {
      expect(calculatePlotArea("-50", "30", "ft").isValid).toBe(false);
      expect(calculatePlotArea("0", "30", "ft").isValid).toBe(false);
      expect(calculatePlotArea("abc", "30", "ft").isValid).toBe(false);
      expect(calculatePlotArea("50", "", "ft").isValid).toBe(false);
    });

    it("verifies all length units have valid symbols and conversion factors", () => {
      expect(LENGTH_UNITS.length).toBeGreaterThanOrEqual(4);
      LENGTH_UNITS.forEach((unit) => {
        expect(unit.toFeetFactor).toBeGreaterThan(0);
        expect(unit.name).toBeTruthy();
      });
    });
  });

  // ==========================================
  // 2. COMPOUND TRADITIONAL UNIT CONVERTER TESTS
  // ==========================================
  describe("2. Compound Traditional Unit Converter Engine", () => {
    it("aggregates UP Pucca Bigha + Biswa + Biswansi correctly (1 Bigha 10 Biswa = 40,837.5 sq ft)", () => {
      const res = calculateCompoundArea("up_pucca", {
        bigha: "1",
        biswa: "10",
        biswansi: "0",
      });
      // 1 Pucca Bigha = 27,225 sq ft
      // 10 Biswa = 10 * 1,361.25 = 13,612.5 sq ft
      // Total = 40,837.5 sq ft
      expect(res.totalSqFt).toBe(40837.5);
      expect(res.totalAcre).toBeCloseTo(40837.5 / 43560, 4);
    });

    it("aggregates UP Kaccha Bigha (3 Kaccha Bigha = 1 Pucca Bigha = 27,225 sq ft)", () => {
      const res = calculateCompoundArea("up_kaccha", {
        bigha_kaccha: "3",
        biswa_kaccha: "0",
        biswansi_kaccha: "0",
      });
      expect(res.totalSqFt).toBe(27225);
    });

    it("aggregates Bihar 6-Haath Tirhut (1 Bigha 10 Kattha = 48,600 sq ft)", () => {
      const res = calculateCompoundArea("bihar_6haath", {
        bigha_br6: "1",
        kattha_br6: "10",
        dhur_br6: "0",
      });
      // 1 Bigha (6-haath) = 32,400 sq ft
      // 10 Kattha = 10 * 1,620 = 16,200 sq ft
      // Total = 48,600 sq ft
      expect(res.totalSqFt).toBe(48600);
    });

    it("aggregates West Bengal Bigha-Kattha-Chatak (1 Bigha 5 Kattha 8 Chatak = 18,360 sq ft)", () => {
      const res = calculateCompoundArea("wb_bengal", {
        bigha_wb: "1",
        kattha_wb: "5",
        chatak_wb: "8",
      });
      // 1 WB Bigha = 14,400 sq ft
      // 5 Kattha = 5 * 720 = 3,600 sq ft
      // 8 Chatak = 8 * 45 = 360 sq ft
      // Total = 18,360 sq ft
      expect(res.totalSqFt).toBe(18360);
    });

    it("aggregates Punjab/Haryana Killa-Kanal-Marla (1 Killa 4 Kanal = 65,340 sq ft)", () => {
      const res = calculateCompoundArea("punjab_killa", {
        killa_pb: "1",
        kanal_pb: "4",
        marla_pb: "0",
      });
      // 1 Killa = 43,560 sq ft
      // 4 Kanal = 4 * 5,445 = 21,780 sq ft
      // Total = 65,340 sq ft (1.5 Acres)
      expect(res.totalSqFt).toBe(65340);
      expect(res.totalAcre).toBe(1.5);
    });

    it("decomposes 50,000 sq ft into UP Pucca Bigha, Biswa, and Biswansi", () => {
      const decomp = decomposeAreaIntoSystem("up_pucca", 50000);
      expect(decomp.length).toBe(3);
      // 50,000 sq ft / 27,225 = 1 Pucca Bigha, rem 22,775
      // 22,775 / 1,361.25 = 16 Biswa, rem 995
      // 995 / 68.0625 = 14.618 Biswansi
      expect(decomp[0].subunitId).toBe("bigha");
      expect(decomp[0].count).toBe(1);
      expect(decomp[1].subunitId).toBe("biswa");
      expect(decomp[1].count).toBe(16);
      expect(decomp[2].subunitId).toBe("biswansi");
      expect(Math.floor(decomp[2].count)).toBe(14);
    });

    it("handles zero and negative values gracefully in compound converter", () => {
      const resZero = calculateCompoundArea("up_pucca", { bigha: "0", biswa: "0" });
      expect(resZero.totalSqFt).toBe(0);

      const decompZero = decomposeAreaIntoSystem("wb_bengal", 0);
      expect(decompZero[0].count).toBe(0);
    });
  });

  // ==========================================
  // 3. CUSTOM MEASUREMENT FACTORS TESTS
  // ==========================================
  describe("3. Custom Measurement Factors Engine", () => {
    it("validates valid custom unit against sqft, sqm, sqyd, and acre", () => {
      const vSqft = validateCustomUnitInput("My Hath Bigha", "25000", "sqft");
      expect(vSqft.isValid).toBe(true);
      expect(vSqft.sqFtEquivalent).toBe(25000);

      const vAcre = validateCustomUnitInput("Custom Block", "2", "acre");
      expect(vAcre.isValid).toBe(true);
      expect(vAcre.sqFtEquivalent).toBe(87120);

      const vSqyd = validateCustomUnitInput("Local Gaj Bigha", "2000", "sqyd");
      expect(vSqyd.isValid).toBe(true);
      expect(vSqyd.sqFtEquivalent).toBe(18000);
    });

    it("rejects empty name or invalid factor value", () => {
      expect(validateCustomUnitInput("", "20000", "sqft").isValid).toBe(false);
      expect(validateCustomUnitInput("Test", "-500", "sqft").isValid).toBe(false);
      expect(validateCustomUnitInput("Test", "0", "sqft").isValid).toBe(false);
      expect(validateCustomUnitInput("Test", "invalid", "sqft").isValid).toBe(false);
    });

    it("saves and retrieves presets from localStorage", () => {
      const saveRes = saveCustomPreset("Tehsil Custom Unit", 18500, "sqft", "Local village customary factor");
      expect(saveRes.success).toBe(true);
      expect(saveRes.preset?.name).toBe("Tehsil Custom Unit");
      expect(saveRes.preset?.sqFtEquivalent).toBe(18500);

      const loaded = loadCustomPresets();
      expect(loaded.length).toBe(1);
      expect(loaded[0].name).toBe("Tehsil Custom Unit");

      // Delete preset
      const remaining = deleteCustomPreset(loaded[0].id);
      expect(remaining.length).toBe(0);
      expect(loadCustomPresets().length).toBe(0);
    });
  });

  // ==========================================
  // 4. CONVERSION HISTORY & CSV EXPORT TESTS
  // ==========================================
  describe("4. Conversion History and CSV Export Engine", () => {
    it("records a conversion and prevents immediate duplicate spam", () => {
      const item1 = addHistoryItem({
        fromValue: 5,
        fromUnitId: "acre",
        fromUnitName: "Acre",
        toValue: 200,
        toUnitId: "guntha_mh",
        toUnitName: "Guntha",
        formattedResult: "200",
        stateCode: "MH",
        stateName: "Maharashtra",
        formula: "1 Acre = 40 Guntha",
      });

      expect(item1.id).toBeTruthy();
      expect(loadHistory().length).toBe(1);

      // Immediately adding identical conversion should return the existing item
      const itemDup = addHistoryItem({
        fromValue: 5,
        fromUnitId: "acre",
        fromUnitName: "Acre",
        toValue: 200,
        toUnitId: "guntha_mh",
        toUnitName: "Guntha",
        formattedResult: "200",
        stateCode: "MH",
        stateName: "Maharashtra",
        formula: "1 Acre = 40 Guntha",
      });
      expect(itemDup.id).toBe(item1.id);
      expect(loadHistory().length).toBe(1);
    });

    it("toggles favorite status and deletes items", () => {
      const item = addHistoryItem({
        fromValue: 1,
        fromUnitId: "bigha_up_pucca",
        fromUnitName: "Pucca Bigha",
        toValue: 27225,
        toUnitId: "sqft",
        toUnitName: "Sq Ft",
        formattedResult: "27,225",
        stateCode: "UP",
        stateName: "Uttar Pradesh",
        formula: "1 Pucca Bigha = 27,225 sq ft",
      });

      expect(loadHistory()[0].isFavorite).toBe(false);

      toggleFavorite(item.id);
      expect(loadHistory()[0].isFavorite).toBe(true);

      deleteHistoryItem(item.id);
      expect(loadHistory().length).toBe(0);
    });

    it("exports history to RFC 4180 compliant CSV with headers and legal disclaimer", () => {
      addHistoryItem({
        fromValue: 2.5,
        fromUnitId: "acre",
        fromUnitName: "Acre",
        toValue: 100,
        toUnitId: "guntha_mh",
        toUnitName: "Guntha",
        formattedResult: "100",
        stateCode: "MH",
        stateName: "Maharashtra",
        formula: "1 Acre = 40 Guntha",
      });

      const items = loadHistory();
      const csv = exportHistoryToCsv(items);

      expect(csv).toContain("Bharat Land Converter (https://land.ladestack.in)");
      expect(csv).toContain("Timestamp (UTC)");
      expect(csv).toContain("From Unit");
      expect(csv).toContain("To Unit");
      expect(csv).toContain('"Acre"');
      expect(csv).toContain('"Guntha"');
      expect(csv).toContain('"Maharashtra"');
      expect(csv).not.toContain("bharatlandconverter.in");
    });
  });

  // ==========================================
  // 5. REGIONAL COMPARISON DATA INTEGRITY
  // ==========================================
  describe("5. Regional Comparison Matrix Data Integrity", () => {
    it("contains comprehensive coverage of all major Indian unit families", () => {
      const families = new Set(COMPARISON_DATA.map((d) => d.family));
      expect(families.has("bigha")).toBe(true);
      expect(families.has("kattha")).toBe(true);
      expect(families.has("biswa")).toBe(true);
      expect(families.has("guntha")).toBe(true);
      expect(families.has("kanal_marla")).toBe(true);
      expect(families.has("cent_ground")).toBe(true);
    });

    it("verifies every comparison item has positive dimensions, state, and source provenance", () => {
      COMPARISON_DATA.forEach((entry) => {
        expect(entry.sqFt).toBeGreaterThan(0);
        expect(entry.sqM).toBeGreaterThan(0);
        expect(entry.acres).toBeGreaterThan(0);
        expect(entry.state).toBeTruthy();
        expect(entry.variant).toBeTruthy();
        expect(entry.sourceDoc).toBeTruthy();
        expect(entry.geographicScope).toBeTruthy();
        expect(["OFFICIAL_STANDARD", "REGIONAL_STATUTORY", "CUSTOMARY_UNOFFICIAL"]).toContain(
          entry.confidence,
        );
      });
    });
  });
});
