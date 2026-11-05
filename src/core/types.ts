export type RegionType = "state" | "ut";

export type ConfidenceLevel =
  | "OFFICIAL_STANDARD"      // Defined in statutory acts or official state land record manuals
  | "WIDELY_USED_CUSTOMARY"  // Accepted standard across revenue tehsils and deeds
  | "LOCAL_VARIANT"          // Specific to certain districts, subdivisions, or lagga lengths
  | "HISTORICAL_CUSTOMARY";  // Documented historical tenure unit; modern registry prefers metric

export interface Region {
  code: string;
  name: string;
  nameHi: string;
  type: RegionType;
  officialSystem: string;
  officialSystemHi: string;
  primaryTraditionalUnits: string[];
  notes: string;
  notesHi: string;
}

export interface UnitSubdivision {
  parentUnitId: string;
  factor: number; // e.g. 20 (meaning 20 of this unit = 1 parent unit)
  name: string;
  nameHi: string;
}

export interface UnitProvenance {
  sourceName: string;
  referenceDocument: string;
  legalStatus: string;
  confidence: ConfidenceLevel;
  qualification?: string;
  qualificationHi?: string;
}

export interface LandUnit {
  id: string;
  name: string;
  nameHi: string;
  aliases: string[];
  category: "standard" | "regional";
  sqMeters: number; // Canonical SI base
  sqFt: number;     // Standard exact or survey sq ft
  regionCode: string; // 'ALL' or State Code (e.g. 'UP', 'MH', 'WB')
  regionName?: string;
  variantName?: string;
  variantNameHi?: string;
  subdivision?: UnitSubdivision;
  note?: string;
  noteHi?: string;
  provenance: UnitProvenance;
}

export interface ConversionResult {
  fromUnit: LandUnit;
  toUnit: LandUnit;
  inputValue: number;
  rawResult: number;
  formattedResult: string;
  formula: string;
  stepCalculation: string;
  isSameUnit: boolean;
  warning?: string;
  confidence: ConfidenceLevel;
}

export interface OneToAllItem {
  unit: LandUnit;
  rawResult: number;
  formattedResult: string;
  isSameUnit: boolean;
}

export interface OneToAllResult {
  fromUnit: LandUnit;
  inputValue: number;
  results: OneToAllItem[];
}

export interface ValidationResult {
  isValid: boolean;
  parsedValue: number;
  errorMessage?: string;
  errorMessageHi?: string;
}

