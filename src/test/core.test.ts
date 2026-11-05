import { describe, it, expect } from "vitest";
import {
  ALL_UNITS,
  UNIT_BY_ID,
  getUnit,
  getUnitsForRegion,
  ALL_REGIONS,
  getRegion,
  convertArea,
  convertOneToAll,
  formatIndianNumber,
  parseAreaInput,
  calculateLandValuation,
} from "../core";

describe("Bharat Land Converter — Core Engine Tests", () => {
  describe("1. Standard Unit Definitions", () => {
    it("verifies 1 Acre = 43,560 sq ft", () => {
      const acre = getUnit("acre")!;
      const sqft = getUnit("sqft")!;
      const result = convertArea(1, acre, sqft);
      expect(result.rawResult).toBe(43560);
      expect(result.formattedResult).toBe("43,560");
    });

    it("verifies 1 Acre = 4,840 sq yards (Gaj)", () => {
      const acre = getUnit("acre")!;
      const sqyd = getUnit("sqyd")!;
      const result = convertArea(1, acre, sqyd);
      expect(result.rawResult).toBe(4840);
      expect(result.formattedResult).toBe("4,840");
    });

    it("verifies 1 Hectare = 10,000 sq meters", () => {
      const hectare = getUnit("hectare")!;
      const sqm = getUnit("sqm")!;
      const result = convertArea(1, hectare, sqm);
      expect(result.rawResult).toBeCloseTo(10000, 4);
    });

    it("verifies 1 Hectare ≈ 2.47105 Acres", () => {
      const hectare = getUnit("hectare")!;
      const acre = getUnit("acre")!;
      const result = convertArea(1, hectare, acre);
      expect(result.rawResult).toBeCloseTo(2.47105, 4);
    });

    it("verifies 1 Cent = 435.6 sq ft (1/100 Acre)", () => {
      const cent = getUnit("decimal_standard")!;
      const sqft = getUnit("sqft")!;
      const acre = getUnit("acre")!;
      expect(convertArea(1, cent, sqft).rawResult).toBe(435.6);
      expect(convertArea(100, cent, acre).rawResult).toBe(1);
    });
  });

  describe("2. Regional Measurement Accuracy & Corrected Audit Benchmarks", () => {
    it("CRITICAL FIX: West Bengal Chatak is 45 sq ft (not 180 sq ft)", () => {
      const chatak = getUnit("chatak_wb")!;
      const kattha = getUnit("kattha_wb")!;
      const bigha = getUnit("bigha_wb")!;
      const sqft = getUnit("sqft")!;

      expect(chatak.sqFt).toBe(45);
      expect(convertArea(1, chatak, sqft).rawResult).toBe(45);
      // 16 Chatak = 1 Kattha = 720 sq ft
      expect(convertArea(16, chatak, kattha).rawResult).toBe(1);
      // 320 Chatak = 1 Bigha = 14,400 sq ft
      expect(convertArea(320, chatak, bigha).rawResult).toBe(1);
    });

    it("STATUTORY FIX: Uttar Pradesh Pucca Bigha is 27,225 sq ft (not casual 27,000)", () => {
      const bighaUp = getUnit("bigha_up_pucca")!;
      const biswaUp = getUnit("biswa_up_pucca")!;
      const biswansiUp = getUnit("biswansi_up")!;
      const acre = getUnit("acre")!;
      const sqft = getUnit("sqft")!;

      expect(bighaUp.sqFt).toBe(27225);
      expect(convertArea(1, bighaUp, sqft).rawResult).toBe(27225);
      // 20 Biswa = 1 Pucca Bigha
      expect(convertArea(20, biswaUp, bighaUp).rawResult).toBe(1);
      // 20 Biswansi = 1 Biswa
      expect(convertArea(20, biswansiUp, biswaUp).rawResult).toBe(1);
      // 1 Pucca Bigha = exactly 5/8 (0.625) Acre
      expect(convertArea(1, bighaUp, acre).rawResult).toBe(0.625);
    });

    it("ACCURACY: Bihar standard 5.5-haath lagga yields 27,225 sq ft Bigha", () => {
      const bighaBr = getUnit("bigha_bihar_standard")!;
      const katthaBr = getUnit("kattha_bihar_standard")!;
      const dhurBr = getUnit("dhur_bihar_standard")!;

      expect(bighaBr.sqFt).toBe(27225);
      expect(katthaBr.sqFt).toBe(1361.25);
      expect(dhurBr.sqFt).toBe(68.0625);

      expect(convertArea(20, dhurBr, katthaBr).rawResult).toBe(1);
      expect(convertArea(20, katthaBr, bighaBr).rawResult).toBe(1);
    });

    it("REGIONAL VARIANT: Bihar 6.0-haath lagga yields 32,400 sq ft Bigha", () => {
      const bigha6 = getUnit("bigha_bihar_6haath")!;
      expect(bigha6.sqFt).toBe(32400);
      expect(convertArea(1, bigha6, getUnit("sqft")!).rawResult).toBe(32400);
    });

    it("verifies Maharashtra Guntha (40 Guntha = 1 Acre)", () => {
      const guntha = getUnit("guntha_mh")!;
      const acre = getUnit("acre")!;
      const sqft = getUnit("sqft")!;

      expect(guntha.sqFt).toBe(1089);
      expect(convertArea(1, guntha, sqft).rawResult).toBe(1089);
      expect(convertArea(40, guntha, acre).rawResult).toBe(1);
    });

    it("verifies Punjab/Haryana Kanal & Marla system", () => {
      const kanal = getUnit("kanal")!;
      const marla = getUnit("marla")!;
      const sarsahi = getUnit("sarsahi")!;
      const killa = getUnit("killa")!;
      const acre = getUnit("acre")!;

      expect(kanal.sqFt).toBe(5445);
      expect(marla.sqFt).toBe(272.25);
      expect(sarsahi.sqFt).toBe(30.25);

      expect(convertArea(9, sarsahi, marla).rawResult).toBe(1);
      expect(convertArea(20, marla, kanal).rawResult).toBe(1);
      expect(convertArea(8, kanal, killa).rawResult).toBe(1);
      expect(convertArea(1, killa, acre).rawResult).toBe(1);
    });

    it("verifies Gujarat Bigha exactness (17,424 sq ft = 16 Guntha = 0.4 Acre)", () => {
      const bighaGj = getUnit("bigha_gj")!;
      const guntha = getUnit("guntha_mh")!;
      const acre = getUnit("acre")!;

      expect(bighaGj.sqFt).toBe(17424);
      expect(convertArea(1, bighaGj, guntha).rawResult).toBe(16);
      expect(convertArea(1, bighaGj, acre).rawResult).toBe(0.4);
    });

    it("verifies Tamil Nadu Ground = 2,400 sq ft", () => {
      const ground = getUnit("ground_tn")!;
      expect(ground.sqFt).toBe(2400);
      expect(convertArea(1, ground, getUnit("sqft")!).rawResult).toBe(2400);
    });

    it("verifies Uttarakhand Nali (2,160 sq ft) and Mutthi (135 sq ft)", () => {
      const nali = getUnit("nali_uk")!;
      const mutthi = getUnit("mutthi_uk")!;
      expect(nali.sqFt).toBe(2160);
      expect(mutthi.sqFt).toBe(135);
      expect(convertArea(16, mutthi, nali).rawResult).toBe(1);
    });
  });

  describe("3. Round-Trip Reversibility and Mathematical Invariants", () => {
    it("round-trip conversion Acre -> Guntha -> Acre returns original value", () => {
      const acre = getUnit("acre")!;
      const guntha = getUnit("guntha_mh")!;
      const initial = 7.5;
      const converted = convertArea(initial, acre, guntha).rawResult;
      const roundTrip = convertArea(converted, guntha, acre).rawResult;
      expect(roundTrip).toBeCloseTo(initial, 10);
    });

    it("round-trip conversion UP Bigha -> Marla -> UP Bigha", () => {
      const bigha = getUnit("bigha_up_pucca")!;
      const marla = getUnit("marla")!;
      const initial = 12.345;
      const converted = convertArea(initial, bigha, marla).rawResult;
      const roundTrip = convertArea(converted, marla, bigha).rawResult;
      expect(roundTrip).toBeCloseTo(initial, 10);
    });

    it("identity conversion (same unit) returns exact value without alteration", () => {
      const unit = getUnit("acre")!;
      const result = convertArea(100.55, unit, unit);
      expect(result.rawResult).toBe(100.55);
      expect(result.isSameUnit).toBe(true);
    });

    it("zero input converts cleanly to zero", () => {
      const acre = getUnit("acre")!;
      const sqft = getUnit("sqft")!;
      const result = convertArea(0, acre, sqft);
      expect(result.rawResult).toBe(0);
      expect(result.formattedResult).toBe("0");
    });

    it("rejects negative numbers with an explicit error", () => {
      const acre = getUnit("acre")!;
      const sqft = getUnit("sqft")!;
      expect(() => convertArea(-5, acre, sqft)).toThrow("Physical land area cannot be negative");
    });
  });

  describe("4. Number Formatting and Decimal Preservation", () => {
    it("CRITICAL: preserves decimal places for numbers >= 100 (does not round to integer)", () => {
      expect(formatIndianNumber(120.75)).toBe("120.75");
      expect(formatIndianNumber(4046.8564)).toBe("4,046.8564");
      expect(formatIndianNumber(1089.5)).toBe("1,089.5");
    });

    it("applies Indian numbering comma grouping correctly", () => {
      expect(formatIndianNumber(1000)).toBe("1,000");
      expect(formatIndianNumber(100000)).toBe("1,00,000");
      expect(formatIndianNumber(10000000)).toBe("1,00,00,000");
      expect(formatIndianNumber(1234567.89)).toBe("12,34,567.89");
    });

    it("formats zero correctly as '0'", () => {
      expect(formatIndianNumber(0)).toBe("0");
    });

    it("formats negative numbers without string corruption", () => {
      expect(formatIndianNumber(-150)).toBe("-150");
      expect(formatIndianNumber(-1234567.8)).toBe("-12,34,567.8");
    });

    it("handles scientific notation and floating point edge cases safely", () => {
      expect(formatIndianNumber(0.00005)).toBe("0.00005");
      expect(formatIndianNumber(NaN)).toBe("0");
      expect(formatIndianNumber(Infinity)).toBe("0");
    });
  });

  describe("5. Input Validation", () => {
    it("parses clean numbers and numbers with Indian commas", () => {
      expect(parseAreaInput("1,00,000")).toEqual({ isValid: true, value: 100000 });
      expect(parseAreaInput("  45.50  ")).toEqual({ isValid: true, value: 45.5 });
    });

    it("rejects negative numbers with explanatory message", () => {
      const res = parseAreaInput("-10");
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toBe("Physical land area cannot be negative");
    });

    it("rejects non-numeric gibberish", () => {
      expect(parseAreaInput("abc").isValid).toBe(false);
      expect(parseAreaInput("12.34.56").isValid).toBe(false);
      expect(parseAreaInput("").isValid).toBe(false);
    });
  });

  describe("6. Complete State and Union Territory Coverage", () => {
    it("contains exactly 36 Indian regions (28 states + 8 union territories)", () => {
      expect(ALL_REGIONS.length).toBe(36);
      const states = ALL_REGIONS.filter((r) => r.type === "state");
      const uts = ALL_REGIONS.filter((r) => r.type === "ut");
      expect(states.length).toBe(28);
      expect(uts.length).toBe(8);
    });

    it("can retrieve regions by code and name", () => {
      expect(getRegion("MH")?.name).toBe("Maharashtra");
      expect(getRegion("uttar pradesh")?.code).toBe("UP");
      expect(getRegion("DL")?.name).toBe("Delhi");
    });

    it("filters units dynamically based on selected region", () => {
      const mhUnits = getUnitsForRegion("MH");
      expect(mhUnits.some((u) => u.id === "guntha_mh")).toBe(true);
      expect(mhUnits.some((u) => u.id === "acre")).toBe(true); // Standard included
      expect(mhUnits.some((u) => u.id === "bigha_up_pucca")).toBe(false); // UP unit excluded
    });
  });

  describe("7. Land Valuation Calculator", () => {
    it("computes accurate total land price and outputs Lakh/Crore words", () => {
      const acre = getUnit("acre")!;
      const sqft = getUnit("sqft")!;
      // 2 Acres @ ₹ 500 per sq ft
      // 2 Acres = 87,120 sq ft -> 87,120 × 500 = ₹ 4,35,60,000 (4.356 Crore)
      const val = calculateLandValuation(2, acre, 500, sqft);
      expect(val.totalValue).toBe(43560000);
      expect(val.formattedCurrency).toBe("₹ 4,35,60,000");
      expect(val.wordsEn).toContain("Crore");
      expect(val.wordsHi).toContain("करोड़");
    });
  });

  describe("8. Batch One-to-All Conversion", () => {
    it("converts a single input into all units in a region", () => {
      const acre = getUnit("acre")!;
      const units = getUnitsForRegion("UP");
      const oneToAll = convertOneToAll(1, acre, units);
      expect(oneToAll.results.length).toBe(units.length);

      const bighaResult = oneToAll.results.find((r) => r.unit.id === "bigha_up_pucca");
      expect(bighaResult?.rawResult).toBe(1.6); // 1 Acre = 1.6 Pucca Bigha (43560 / 27225)
    });
  });
});

