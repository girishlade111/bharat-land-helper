/**
 * Legacy compatibility facade.
 * Re-exports verified constants and functions from the core conversion engine.
 */
import {
  ALL_UNITS,
  ALL_REGIONS,
  convertArea,
  formatIndianNumber as coreFormatIndianNumber,
  formatIndianCurrency as coreFormatIndianCurrency,
  getUnit,
} from "@/core";

export interface LandUnit {
  id: string;
  name: string;
  nameHi: string;
  sqft: number;
  category: string;
  note?: string;
  noteHi?: string;
}

export const UNITS: LandUnit[] = ALL_UNITS.map((u) => ({
  id: u.id,
  name: u.name,
  nameHi: u.nameHi,
  sqft: u.sqFt,
  category: u.category === "standard" ? "Standard" : u.regionName || u.regionCode,
  note: u.note,
  noteHi: u.noteHi,
}));

export const CATEGORIES = [
  "All",
  "Standard",
  "Maharashtra",
  "UP",
  "Bihar",
  "West Bengal",
  "Assam",
  "Rajasthan",
  "MP",
  "Gujarat",
  "Punjab",
  "HP",
  "South",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const STATES = ALL_REGIONS.map((r) => r.name);

export function convert(value: number, fromUnitSqft: number, toUnitSqft: number): number {
  if (toUnitSqft === 0) return 0;
  return (value * fromUnitSqft) / toUnitSqft;
}

export const formatIndianNumber = coreFormatIndianNumber;

export function formatIndianCurrency(num: number): { formatted: string; words: string } {
  const res = coreFormatIndianCurrency(num);
  return { formatted: res.formatted, words: res.wordsEn };
}
