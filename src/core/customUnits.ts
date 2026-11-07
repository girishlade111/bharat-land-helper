// src/core/customUnits.ts
// Custom Local Land Measurement Unit Engine for Bharat Land Converter
// Enables users to define, preview, and persist non-standard customary local land factors

import type { LandUnit } from "./types";

export type CustomReferenceUnit = "sqft" | "sqm" | "sqyd" | "acre";

export interface CustomReferenceOption {
  id: CustomReferenceUnit;
  name: string;
  nameHi: string;
  symbol: string;
  toSqFt: number; // multiply by this to get square feet
}

export const CUSTOM_REFERENCE_UNITS: CustomReferenceOption[] = [
  { id: "sqft", name: "Square Feet", nameHi: "वर्ग फीट", symbol: "sq ft", toSqFt: 1 },
  { id: "sqm", name: "Square Metre", nameHi: "वर्ग मीटर", symbol: "sq m", toSqFt: 1 / 0.09290304 }, // ~10.7639 sq ft
  { id: "sqyd", name: "Square Yard / Gaj", nameHi: "वर्ग गज", symbol: "sq yd", toSqFt: 9 },
  { id: "acre", name: "Acre", nameHi: "एकड़", symbol: "Acre", toSqFt: 43560 },
];

export interface CustomUnitPreset {
  id: string;
  name: string;
  referenceUnit: CustomReferenceUnit;
  factor: number;
  sqFtEquivalent: number;
  createdAt: string;
  note?: string;
}

export const CUSTOM_UNITS_STORAGE_KEY = "bharat_custom_units_v1";

// Reserved official unit keywords that cannot be used as custom unit names to avoid collision
const RESERVED_UNIT_NAMES = new Set([
  "acre",
  "hectare",
  "sqft",
  "sqm",
  "sqyd",
  "guntha",
  "bigha",
  "biswa",
  "biswansi",
  "kattha",
  "katha",
  "dhur",
  "dhurki",
  "chatak",
  "kanal",
  "marla",
  "sarsahi",
  "killa",
  "ground",
  "cent",
  "decimal",
  "gaj",
  "vigha",
  "lecha",
  "ankanam",
]);

export function calculateCustomUnitSqFt(factor: number, referenceUnit: CustomReferenceUnit): number {
  const ref = CUSTOM_REFERENCE_UNITS.find((r) => r.id === referenceUnit) || CUSTOM_REFERENCE_UNITS[0];
  return factor * ref.toSqFt;
}

/**
 * Strict regex for valid Indian comma grouping (e.g. 1,000 or 1,00,000 or 10,00,000)
 */
const INDIAN_COMMA_REGEX = /^\+?\d{1,2}(,\d{2})*,\d{3}(\.\d+)?$/;

/**
 * Strict regex for standard international 3-digit comma grouping (e.g. 1,000 or 1,000,000)
 */
const STANDARD_COMMA_REGEX = /^\+?\d{1,3}(,\d{3})+(\.\d+)?$/;

/**
 * Strict regex for plain positive decimal number or scientific notation:
 * e.g. 20, 20.5, 0.0001, .5, 1e-4, 2.5E3
 */
const STRICT_NUMBER_REGEX = /^\+?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/;

export interface StrictNumericResult {
  isValid: boolean;
  value: number;
  error?: string;
  errorHi?: string;
}

/**
 * Strictly parses and validates a custom conversion factor.
 * Parses the entire input, rejecting trailing characters, multiple decimals,
 * malformed comma grouping, NaN, Infinity, negative values, and zero.
 */
export function parseStrictCustomFactor(
  input: string | number | null | undefined,
  maxBound: number = 10_000_000
): StrictNumericResult {
  if (input === null || input === undefined || input === "") {
    return {
      isValid: false,
      value: 0,
      error: "Please enter a valid numeric conversion factor.",
      errorHi: "कृपया एक मान्य संख्यात्मक रूपांतरण कारक दर्ज करें।",
    };
  }

  let num = 0;
  if (typeof input === "number") {
    if (isNaN(input) || !isFinite(input)) {
      return {
        isValid: false,
        value: 0,
        error: "Please enter a valid numeric conversion factor.",
        errorHi: "कृपया एक मान्य संख्यात्मक रूपांतरण कारक दर्ज करें।",
      };
    }
    num = input;
  } else {
    const trimmed = String(input).trim();
    if (!trimmed) {
      return {
        isValid: false,
        value: 0,
        error: "Please enter a valid numeric conversion factor.",
        errorHi: "कृपया एक मान्य संख्यात्मक रूपांतरण कारक दर्ज करें।",
      };
    }

    let sanitized = trimmed;
    if (trimmed.includes(",")) {
      if (!INDIAN_COMMA_REGEX.test(trimmed) && !STANDARD_COMMA_REGEX.test(trimmed)) {
        return {
          isValid: false,
          value: 0,
          error: "Malformed number format: invalid comma grouping.",
          errorHi: "अमान्य संख्या प्रारूप: अल्पविराम का अमान्य समूह।",
        };
      }
      sanitized = trimmed.replace(/,/g, "");
    }

    if (!STRICT_NUMBER_REGEX.test(sanitized)) {
      return {
        isValid: false,
        value: 0,
        error: "Please enter a valid numeric conversion factor.",
        errorHi: "कृपया एक मान्य संख्यात्मक रूपांतरण कारक दर्ज करें।",
      };
    }

    num = Number(sanitized);
    if (isNaN(num) || !isFinite(num)) {
      return {
        isValid: false,
        value: 0,
        error: "Please enter a valid numeric conversion factor.",
        errorHi: "कृपया एक मान्य संख्यात्मक रूपांतरण कारक दर्ज करें।",
      };
    }
  }

  if (num === 0) {
    return {
      isValid: false,
      value: 0,
      error: "Conversion factor must be greater than zero.",
      errorHi: "रूपांतरण कारक शून्य से अधिक होना चाहिए।",
    };
  }
  if (num < 0) {
    return {
      isValid: false,
      value: num,
      error: "Conversion factor cannot be negative.",
      errorHi: "रूपांतरण कारक ऋणात्मक नहीं हो सकता।",
    };
  }
  if (num > maxBound) {
    return {
      isValid: false,
      value: num,
      error: `Factor exceeds maximum limit (${maxBound.toLocaleString("en-IN")}).`,
      errorHi: `कारक अधिकतम सीमा (${maxBound.toLocaleString("en-IN")}) से अधिक है।`,
    };
  }

  return { isValid: true, value: num };
}

export function validateCustomUnitInput(
  name: string,
  factorInput: string | number,
  referenceUnit: CustomReferenceUnit
): { isValid: boolean; factor: number; sqFtEquivalent: number; error?: string; errorHi?: string } {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { isValid: false, factor: 0, sqFtEquivalent: 0, error: "Unit name is required.", errorHi: "इकाई का नाम आवश्यक है।" };
  }
  if (trimmedName.length > 50) {
    return { isValid: false, factor: 0, sqFtEquivalent: 0, error: "Unit name cannot exceed 50 characters.", errorHi: "इकाई का नाम 50 वर्णों से अधिक नहीं हो सकता।" };
  }

  const normalized = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (RESERVED_UNIT_NAMES.has(normalized)) {
    return {
      isValid: false,
      factor: 0,
      sqFtEquivalent: 0,
      error: `'${trimmedName}' is an official standard unit name. Please use a distinctive custom name (e.g. 'Village Hath Bigha').`,
      errorHi: `'${trimmedName}' एक आधिकारिक मानक इकाई नाम है। कृपया कोई विशिष्ट कस्टम नाम चुनें।`,
    };
  }

  const parsed = parseStrictCustomFactor(factorInput, 10_000_000);
  if (!parsed.isValid) {
    return {
      isValid: false,
      factor: 0,
      sqFtEquivalent: 0,
      error: parsed.error,
      errorHi: parsed.errorHi,
    };
  }

  const sqFt = calculateCustomUnitSqFt(parsed.value, referenceUnit);
  return { isValid: true, factor: parsed.value, sqFtEquivalent: sqFt };
}

export function loadCustomPresets(): CustomUnitPreset[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const data = window.localStorage.getItem(CUSTOM_UNITS_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomPreset(
  name: string,
  factor: number,
  referenceUnit: CustomReferenceUnit,
  note?: string
): { success: boolean; preset?: CustomUnitPreset; error?: string } {
  if (typeof window === "undefined" || !window.localStorage) {
    return { success: false, error: "Browser storage is not available." };
  }

  const validation = validateCustomUnitInput(name, factor, referenceUnit);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const existing = loadCustomPresets();
  const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const preset: CustomUnitPreset = {
    id,
    name: name.trim(),
    referenceUnit,
    factor: validation.factor,
    sqFtEquivalent: validation.sqFtEquivalent,
    createdAt: new Date().toISOString(),
    note: note?.trim(),
  };

  const updated = [preset, ...existing.filter((p) => p.name.toLowerCase() !== preset.name.toLowerCase())];
  try {
    window.localStorage.setItem(CUSTOM_UNITS_STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("bharat_custom_units_updated"));
    }
    return { success: true, preset };
  } catch {
    return { success: false, error: "Could not save to browser storage." };
  }
}

export function deleteCustomPreset(id: string): CustomUnitPreset[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const existing = loadCustomPresets();
    const filtered = existing.filter((p) => p.id !== id && `custom_${p.id}` !== id);
    window.localStorage.setItem(CUSTOM_UNITS_STORAGE_KEY, JSON.stringify(filtered));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("bharat_custom_units_updated"));
    }
    return filtered;
  } catch {
    return [];
  }
}

/**
 * Transforms a stored custom preset into a full typed LandUnit for mathematical calculation.
 * Preserves strict isolation with "CUSTOM" region code and "CUSTOMARY_UNOFFICIAL" confidence.
 */
export function customPresetToLandUnit(preset: CustomUnitPreset): LandUnit {
  const unitId = preset.id.startsWith("custom_") ? preset.id : `custom_${preset.id}`;
  const sqFt = preset.sqFtEquivalent;

  return {
    id: unitId,
    name: `${preset.name} (Custom)`,
    nameHi: `${preset.name} (कस्टम)`,
    aliases: [preset.name.toLowerCase(), `custom_${preset.name.toLowerCase()}`],
    category: "regional",
    sqFt,
    sqMeters: sqFt * 0.09290304,
    regionCode: "CUSTOM",
    regionName: "Custom Local Measurement",
    variantName: `Custom: 1 = ${preset.factor} ${preset.referenceUnit}`,
    variantNameHi: `कस्टम: 1 = ${preset.factor} ${preset.referenceUnit}`,
    note: preset.note || `Custom user factor: 1 ${preset.name} = ${sqFt.toLocaleString("en-IN")} sq ft`,
    noteHi: preset.note || `कस्टम कारक: 1 ${preset.name} = ${sqFt.toLocaleString("en-IN")} वर्ग फीट`,
    provenance: {
      sourceName: "User Defined Customary Factor",
      referenceDocument: `Local Custom Factor: 1 Unit = ${preset.factor} ${preset.referenceUnit}`,
      legalStatus: "Unverified private customary definition; not legally recognized by revenue authorities",
      confidence: "CUSTOMARY_UNOFFICIAL",
      evidenceClassification: "CUSTOMARY_UNOFFICIAL",
      qualification: "Private user-defined conversion factor stored in browser localStorage. Not recognized for statutory deed registration.",
    },
  };
}

/**
 * Maximum allowable square feet equivalent for a custom unit preset or snapshot.
 * Corresponds to 10,000,000 Acres (435,600,000,000 sq ft) with safety headroom.
 */
export const MAX_CUSTOM_UNIT_SQFT = 500_000_000_000;

/**
 * Ephemeral in-memory store for validated custom-unit snapshots extracted from shared links.
 * Enables portable calculation across separate browser sessions without requiring local persistence.
 */
export const EPHEMERAL_SNAPSHOT_CACHE = new Map<string, LandUnit>();

export function getEphemeralSnapshotUnit(id: string): LandUnit | undefined {
  if (!id) return undefined;
  if (EPHEMERAL_SNAPSHOT_CACHE.has(id)) {
    return EPHEMERAL_SNAPSHOT_CACHE.get(id);
  }
  const match = id.match(/^custom_snap_([0-9.eE+-]+)(?:_(.*))?$/);
  if (match) {
    const parsed = parseStrictCustomFactor(match[1], MAX_CUSTOM_UNIT_SQFT);
    if (parsed.isValid) {
      const name = match[2];
      return parseCustomSnapshotParam(parsed.value, name);
    }
  }
  return undefined;
}

/**
 * Parses and safely validates custom unit snapshot parameters from a shared URL.
 * Sanitizes all input strings, enforces positive finite bounded factors, and produces
 * an immutable ephemeral LandUnit without writing to browser localStorage.
 */
export function parseCustomSnapshotParam(
  factorInput: string | number | null | undefined,
  nameInput?: string | null
): LandUnit | null {
  const parsed = parseStrictCustomFactor(factorInput, MAX_CUSTOM_UNIT_SQFT);
  if (!parsed.isValid) {
    return null;
  }
  const num = parsed.value;

  const rawName = (nameInput || "Custom Unit").trim();
  // Strip HTML tags, quotes, control characters, and limit to 50 characters
  const cleanName =
    rawName
      .replace(/<[^>]*>?/gm, "")
      .replace(/[^\w\s\u0900-\u097F.-]/g, "")
      .trim()
      .slice(0, 50) || "Custom Unit";

  const cleanSlug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
  const snapId = `custom_snap_${num}${cleanSlug ? `_${cleanSlug}` : ""}`;

  const unit: LandUnit = {
    id: snapId,
    name: `${cleanName} (Custom Snapshot)`,
    nameHi: `${cleanName} (कस्टम स्नैपशॉट)`,
    aliases: [cleanName.toLowerCase(), snapId],
    category: "regional",
    sqFt: num,
    sqMeters: num * 0.09290304,
    regionCode: "CUSTOM",
    regionName: "Custom Local Measurement",
    variantName: `Snapshot: 1 = ${num} sq ft`,
    variantNameHi: `स्नैपशॉट: 1 = ${num} वर्ग फीट`,
    note: `Shared custom snapshot: 1 ${cleanName} = ${num.toLocaleString("en-IN")} sq ft`,
    noteHi: `साझा कस्टम स्नैपशॉट: 1 ${cleanName} = ${num.toLocaleString("en-IN")} वर्ग फीट`,
    provenance: {
      sourceName: "Shared Custom Unit Snapshot",
      referenceDocument: `URL Snapshot: 1 Unit = ${num} sq ft`,
      legalStatus: "Unverified private customary definition; snapshot from shared URL",
      confidence: "CUSTOMARY_UNOFFICIAL",
      evidenceClassification: "CUSTOMARY_UNOFFICIAL",
      qualification: "Ephemeral custom unit snapshot preserved from a shared calculation link.",
      lastVerifiedDate: "2026-11-06",
    },
  };

  EPHEMERAL_SNAPSHOT_CACHE.set(snapId, unit);
  return unit;
}

/**
 * Returns all active custom units transformed into LandUnit objects,
 * including both persisted local presets and active ephemeral link snapshots.
 */
export function getCustomLandUnits(): LandUnit[] {
  const presets = loadCustomPresets();
  const presetUnits = presets.map(customPresetToLandUnit);
  const seenIds = new Set(presetUnits.map((u) => u.id));
  const result = [...presetUnits];

  for (const [id, ephemeral] of EPHEMERAL_SNAPSHOT_CACHE.entries()) {
    if (!seenIds.has(id)) {
      result.push(ephemeral);
      seenIds.add(id);
    }
  }

  return result;
}
