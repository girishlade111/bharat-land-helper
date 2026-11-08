// src/test/phase3a5.test.ts
// Phase 3A.5 Release Hardening & Invariant Verification Suite
// Covers: Mathematical Invariants, WB Bigha Accuracy, Punjab 66-inch Karam Schedule,
// Bihar Lagga Systems, History Migration Across All Legacy Keys, and Reversibility

import { describe, it, expect, beforeEach } from "vitest";
import { ALL_UNITS, getUnit, SQFT_TO_SQM } from "../core/units";
import { convertArea } from "../core/converter";
import {
  migrateV1Item,
  loadHistory,
  saveHistory,
  HISTORY_STORAGE_KEY_V1,
  HISTORY_STORAGE_KEY_LEGACY_ALT,
  HISTORY_STORAGE_KEY_V2,
  type ConversionHistoryItem,
} from "../core/history";
import { COMPOUND_SYSTEMS } from "../core/compoundUnits";
import { calculatePlotArea } from "../core/plotCalculator";

describe("Phase 3A.5 — Invariant & Precision Verification", () => {
  // 1. Critical West Bengal Bigha Invariant
  describe("1. West Bengal Bigha Mathematical Consistency", () => {
    it("P3A5-001: 1 Acre is exactly 43,560 sq ft, and 1/3 Acre is exactly 14,520 sq ft", () => {
      const acreSqFt = 43560;
      const oneThirdAcre = acreSqFt / 3;
      expect(oneThirdAcre).toBe(14520);
    });

    it("P3A5-002: Bengal Bigha is exactly 14,400 sq ft and NOT equal to 1/3 Acre (diff = 120 sq ft)", () => {
      const wbBigha = getUnit("bigha_wb");
      expect(wbBigha).toBeDefined();
      expect(wbBigha?.sqFt).toBe(14400);

      const acreSqFt = 43560;
      const exactOneThird = acreSqFt / 3;

      // Mathematical proof of disparity:
      expect(wbBigha!.sqFt).not.toBe(exactOneThird);
      expect(exactOneThird - wbBigha!.sqFt).toBe(120);

      // Exact fraction is 40/121 Acre, which is approximately 0.3305785...
      const expectedAcreRatio = 14400 / 43560;
      expect(expectedAcreRatio).toBeCloseTo(40 / 121, 8);
      expect(expectedAcreRatio).toBeCloseTo(0.3305785, 6);
    });

    it("P3A5-003: Bengal Bigha subdivision is strictly consistent (1 Bigha = 20 Kattha = 320 Chatak)", () => {
      const bigha = getUnit("bigha_wb");
      const kattha = getUnit("kattha_wb");
      const chatak = getUnit("chatak_wb");

      expect(bigha?.sqFt).toBe(14400);
      expect(kattha?.sqFt).toBe(720);
      expect(chatak?.sqFt).toBe(45);

      expect(bigha!.sqFt / 20).toBe(kattha!.sqFt);
      expect(kattha!.sqFt / 16).toBe(chatak!.sqFt);
      expect(bigha!.sqFt / 320).toBe(chatak!.sqFt);
    });
  });

  // 2. Critical Punjab Karam & Marla Invariant
  describe("2. Punjab 66-inch Karam Schedule & Mathematical Consistency", () => {
    it("P3A5-004: Standard Punjab Karam is 66 inches (5.5 ft) and forms 30.25 sq ft Sarsahi", () => {
      const karamInches = 66;
      const karamFeet = karamInches / 12; // 5.5 ft
      expect(karamFeet).toBe(5.5);

      const sarsahiSqFt = karamFeet * karamFeet; // 30.25 sq ft
      expect(sarsahiSqFt).toBe(30.25);

      const sarsahiUnit = getUnit("sarsahi");
      expect(sarsahiUnit?.sqFt).toBe(30.25);
    });

    it("P3A5-005: 9 Sarsahi strictly equals 1 Marla (272.25 sq ft)", () => {
      const sarsahi = getUnit("sarsahi");
      const marla = getUnit("marla");

      expect(sarsahi?.sqFt).toBe(30.25);
      expect(marla?.sqFt).toBe(272.25);
      expect(sarsahi!.sqFt * 9).toBe(marla!.sqFt);
    });

    it("P3A5-006: 20 Marla strictly equals 1 Kanal (5,445 sq ft) and 8 Kanal strictly equals 1 Killa (43,560 sq ft)", () => {
      const marla = getUnit("marla");
      const kanal = getUnit("kanal");
      const killa = getUnit("killa");

      expect(marla?.sqFt).toBe(272.25);
      expect(kanal?.sqFt).toBe(5445);
      expect(killa?.sqFt).toBe(43560);

      expect(marla!.sqFt * 20).toBe(kanal!.sqFt);
      expect(kanal!.sqFt * 8).toBe(killa!.sqFt);
      expect(killa!.sqFt).toBe(43560); // Exactly 1 Imperial Acre
    });

    it("P3A5-007: Compound units hierarchy for Punjab reflects exact 66-inch Karam system", () => {
      const pbSystem = COMPOUND_SYSTEMS.find((h) => h.id === "punjab_killa");
      expect(pbSystem).toBeDefined();
      expect(pbSystem?.notes).toContain("66 in");

      const killaSub = pbSystem?.subunits.find((t) => t.id === "killa_pb");
      const kanalSub = pbSystem?.subunits.find((t) => t.id === "kanal_pb");
      const marlaSub = pbSystem?.subunits.find((t) => t.id === "marla_pb");
      const sarsahiSub = pbSystem?.subunits.find((t) => t.id === "sarsahi_pb");

      expect(killaSub?.sqFt).toBe(43560);
      expect(kanalSub?.sqFt).toBe(5445);
      expect(marlaSub?.sqFt).toBe(272.25);
      expect(sarsahiSub?.sqFt).toBe(30.25);
    });
  });

  // 3. Bihar Lagga Invariant Verification
  describe("3. Bihar Lagga Systems & Customary Qualifications", () => {
    it("P3A5-008: 5.5-haath Lagga yields exactly 27,225 sq ft Bigha (Standard System)", () => {
      const haathFeet = 1.5; // 18 inches
      const laggaLength = 5.5 * haathFeet; // 8.25 feet
      const dhurSqFt = laggaLength * laggaLength; // 68.0625 sq ft
      const katthaSqFt = dhurSqFt * 20; // 1,361.25 sq ft
      const bighaSqFt = katthaSqFt * 20; // 27,225 sq ft

      expect(laggaLength).toBe(8.25);
      expect(dhurSqFt).toBe(68.0625);
      expect(katthaSqFt).toBe(1361.25);
      expect(bighaSqFt).toBe(27225);

      const bighaUnit = getUnit("bigha_bihar_standard");
      expect(bighaUnit?.sqFt).toBe(27225);
    });

    it("P3A5-009: 6.0-haath Lagga yields exactly 32,400 sq ft Bigha with conservative customary qualification", () => {
      const haathFeet = 1.5;
      const laggaLength = 6.0 * haathFeet; // 9.0 feet
      const dhurSqFt = laggaLength * laggaLength; // 81.0 sq ft
      const katthaSqFt = dhurSqFt * 20; // 1,620 sq ft
      const bighaSqFt = katthaSqFt * 20; // 32,400 sq ft

      expect(laggaLength).toBe(9.0);
      expect(dhurSqFt).toBe(81.0);
      expect(katthaSqFt).toBe(1620.0);
      expect(bighaSqFt).toBe(32400.0);

      const bighaUnit = getUnit("bigha_bihar_6haath");
      expect(bighaUnit?.sqFt).toBe(32400);
      expect(bighaUnit?.provenance?.legalStatus).toContain("Documented customary 6.0-haath variant");
      expect(bighaUnit?.provenance?.legalStatus).toContain("must be verified against district revenue records");
    });
  });

  // 4. History Migration Across All Legacy Storage Keys
  describe("4. Comprehensive History Migration & Key Compatibility", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("P3A5-010: Migrates records from bharat_calc_history_v1 safely into v2", () => {
      const legacyCalcItem = {
        id: "calc-hist-legacy-01",
        timestamp: "2026-02-15T10:00:00.000Z",
        fromValue: 5,
        fromUnitId: "guntha_mh",
        fromUnitName: "Guntha",
        toValue: 5445,
        toUnitId: "sqft",
        toUnitName: "Square Feet",
        formattedResult: "5,445",
        stateCode: "MH",
      };

      localStorage.setItem(HISTORY_STORAGE_KEY_LEGACY_ALT, JSON.stringify([legacyCalcItem]));

      const loaded = loadHistory();
      expect(loaded.length).toBe(1);
      expect(loaded[0].id).toBe("calc-hist-legacy-01");
      expect(loaded[0].dataVersion).toBe("v2");
      expect(loaded[0].fromUnitSqFtSnapshot).toBe(1089);
      expect(loaded[0].toUnitSqFtSnapshot).toBe(1);
      expect(loaded[0].snapshotProvenance).toBe("RECOVERED_FROM_STORED_RESULT");

      // Verify it was persisted to v2
      const v2Data = localStorage.getItem(HISTORY_STORAGE_KEY_V2);
      expect(v2Data).toContain("calc-hist-legacy-01");
    });

    it("P3A5-011: Idempotently merges v1 and v2 records without duplicates", () => {
      const itemA: ConversionHistoryItem = {
        id: "unique-item-a",
        dataVersion: "v2",
        timestamp: "2026-03-01T12:00:00.000Z",
        fromValue: 1,
        fromUnitId: "acre",
        fromUnitName: "Acre",
        fromUnitSqFtSnapshot: 43560,
        toValue: 40,
        toUnitId: "guntha_mh",
        toUnitName: "Guntha",
        toUnitSqFtSnapshot: 1089,
        formattedResult: "40",
        stateCode: "MH",
        stateName: "Maharashtra",
        formula: "1 Acre × 40 = 40 Guntha",
      };

      // Put itemA in v2
      localStorage.setItem(HISTORY_STORAGE_KEY_V2, JSON.stringify([itemA]));

      // Put duplicate itemA + new itemB in legacy v1
      const itemB = {
        id: "unique-item-b",
        timestamp: "2026-03-02T12:00:00.000Z",
        fromValue: 2,
        fromUnitId: "acre",
        fromUnitName: "Acre",
        toValue: 87120,
        toUnitId: "sqft",
        toUnitName: "Square Feet",
        formattedResult: "87,120",
        stateCode: "MH",
      };

      localStorage.setItem(HISTORY_STORAGE_KEY_V1, JSON.stringify([itemA, itemB]));

      const loaded = loadHistory();
      expect(loaded.length).toBe(2);
      const ids = loaded.map((i) => i.id);
      expect(ids).toContain("unique-item-a");
      expect(ids).toContain("unique-item-b");
    });

    it("P3A5-012: Handles corrupted JSON gracefully without failing or losing valid data", () => {
      localStorage.setItem(HISTORY_STORAGE_KEY_V2, "CORRUPTED{INVALID-JSON");
      const itemValid = {
        id: "safe-item",
        timestamp: "2026-03-01T00:00:00.000Z",
        fromValue: 1,
        fromUnitId: "acre",
        fromUnitName: "Acre",
        toValue: 43560,
        toUnitId: "sqft",
        toUnitName: "Square Feet",
        formattedResult: "43,560",
        stateCode: "MH",
      };
      localStorage.setItem(HISTORY_STORAGE_KEY_V1, JSON.stringify([itemValid]));

      const loaded = loadHistory();
      expect(loaded.length).toBe(1);
      expect(loaded[0].id).toBe("safe-item");
    });
  });

  // 5. Mathematical Reversibility of Core Unit Conversions
  describe("5. Mathematical Reversibility Across Supported Units", () => {
    it("P3A5-013: All standard and regional units convert to Sq Ft and back reversibly within floating epsilon", () => {
      const sqFtUnit = getUnit("sqft")!;

      for (const unit of ALL_UNITS) {
        if (unit.id === "sqft") continue;

        // Convert 100 units to sqft
        const toSqFt = convertArea(100, unit, sqFtUnit, 8);
        expect(toSqFt.rawResult).toBeCloseTo(100 * unit.sqFt, 4);

        // Convert back
        const fromSqFt = convertArea(toSqFt.rawResult, sqFtUnit, unit, 8);
        expect(fromSqFt.rawResult).toBeCloseTo(100, 4);
      }
    });

    it("P3A5-014: Plot Dimensions Engine strictly computes rectangular geometry", () => {
      const result = calculatePlotArea(40, 30, "ft");
      expect(result.isValid).toBe(true);
      expect(result.areaSqFt).toBe(1200);
      expect(result.perimeterFt).toBe(140);
      expect(result.aspectRatio).toBeCloseTo(40 / 30, 4);
      expect(result.breakdown.gunthaMH).toBeCloseTo(1200 / 1089, 4);
    });

    it("P3A5-015: Exact metric conversion invariants (1 Hectare = 10,000 m² = 107,639.104 sq ft)", () => {
      const hectare = getUnit("hectare")!;
      const sqMetersExpected = 10000;
      expect(hectare.sqMeters).toBe(sqMetersExpected);

      // 1 sq meter = 1 / (0.3048^2) sq ft = 10.763910416709722 sq ft
      const expectedSqFt = 10000 / (0.3048 * 0.3048);
      expect(hectare.sqFt).toBeCloseTo(expectedSqFt, 3);
    });
  });
});
