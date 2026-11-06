// src/core/customUnits.ts
// Custom Local Land Measurement Unit Engine for Bharat Land Converter
// Enables users to define, preview, and persist non-standard customary local land factors

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

export function calculateCustomUnitSqFt(factor: number, referenceUnit: CustomReferenceUnit): number {
  const ref = CUSTOM_REFERENCE_UNITS.find((r) => r.id === referenceUnit) || CUSTOM_REFERENCE_UNITS[0];
  return factor * ref.toSqFt;
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

  let num = 0;
  if (typeof factorInput === "number") {
    num = factorInput;
  } else {
    const clean = String(factorInput).trim().replace(/,/g, "");
    num = parseFloat(clean);
  }

  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, factor: 0, sqFtEquivalent: 0, error: "Please enter a valid numeric conversion factor.", errorHi: "कृपया एक मान्य संख्यात्मक रूपांतरण कारक दर्ज करें।" };
  }
  if (num <= 0) {
    return { isValid: false, factor: 0, sqFtEquivalent: 0, error: "Conversion factor must be greater than zero.", errorHi: "रूपांतरण कारक शून्य से अधिक होना चाहिए।" };
  }
  if (num > 10_000_000) {
    return { isValid: false, factor: 0, sqFtEquivalent: 0, error: "Factor exceeds maximum limit (10,000,000).", errorHi: "कारक अधिकतम सीमा (10,000,000) से अधिक है।" };
  }

  const sqFt = calculateCustomUnitSqFt(num, referenceUnit);
  return { isValid: true, factor: num, sqFtEquivalent: sqFt };
}

export function loadCustomPresets(): CustomUnitPreset[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const data = localStorage.getItem(CUSTOM_UNITS_STORAGE_KEY);
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
    const filtered = existing.filter((p) => p.id !== id);
    window.localStorage.setItem(CUSTOM_UNITS_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
}
