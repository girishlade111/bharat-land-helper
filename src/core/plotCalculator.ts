// src/core/plotCalculator.ts
// Rectangular Plot Area Calculator Engine for Bharat Land Converter
// Pure mathematical calculations for rectangular land parcels

export type LengthUnit = "ft" | "m" | "yd" | "in";

export interface LengthUnitOption {
  id: LengthUnit;
  name: string;
  nameHi: string;
  symbol: string;
  toFeetFactor: number; // multiply by this to get feet
}

export const LENGTH_UNITS: LengthUnitOption[] = [
  { id: "ft", name: "Feet", nameHi: "फीट", symbol: "ft", toFeetFactor: 1 },
  { id: "m", name: "Metres", nameHi: "मीटर", symbol: "m", toFeetFactor: 1 / 0.3048 }, // exact international foot standard
  { id: "yd", name: "Yards / Gaj", nameHi: "गज / यार्ड", symbol: "yd", toFeetFactor: 3 },
  { id: "in", name: "Inches", nameHi: "इंच", symbol: "in", toFeetFactor: 1 / 12 },
];

export interface PlotCalculationInput {
  length: number;
  width: number;
  unit: LengthUnit;
}

export interface PlotAreaBreakdown {
  sqFt: number;
  sqM: number;
  sqYd: number;
  acre: number;
  hectare: number;
  gunthaMH: number;
  bighaUPPucca: number;
  bighaWB: number;
  cent: number;
}

export interface PlotCalculationResult {
  isValid: boolean;
  errorMessage?: string;
  errorMessageHi?: string;
  length: number;
  width: number;
  unit: LengthUnit;
  lengthFt: number;
  widthFt: number;
  lengthM: number;
  widthM: number;
  areaSqFt: number;
  perimeter: number;
  perimeterFt: number;
  perimeterM: number;
  aspectRatio: number;
  breakdown: PlotAreaBreakdown;
  formula: string;
}

export function parsePlotDimension(input: string | number): { isValid: boolean; value: number; error?: string; errorHi?: string } {
  if (typeof input === "number") {
    if (isNaN(input) || !isFinite(input)) {
      return { isValid: false, value: 0, error: "Please enter a valid finite number.", errorHi: "कृपया एक मान्य संख्या दर्ज करें।" };
    }
    if (input < 0) {
      return { isValid: false, value: 0, error: "Plot dimensions cannot be negative.", errorHi: "भूखंड की विमाएं ऋणात्मक नहीं हो सकती हैं।" };
    }
    return { isValid: true, value: input };
  }

  const trimmed = String(input).trim();
  if (!trimmed) {
    return { isValid: false, value: 0, error: "Dimension is required.", errorHi: "विमा आवश्यक है।" };
  }

  // Remove commas (Indian or western format: 1,500.50)
  const sanitized = trimmed.replace(/,/g, "");
  const num = Number(sanitized);

  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, value: 0, error: "Please enter a valid numeric value.", errorHi: "कृपया एक मान्य संख्यात्मक मान दर्ज करें।" };
  }
  if (num < 0) {
    return { isValid: false, value: 0, error: "Plot dimensions cannot be negative.", errorHi: "भूखंड की विमाएं ऋणात्मक नहीं हो सकती हैं।" };
  }

  return { isValid: true, value: num };
}

export function calculatePlotArea(
  lengthInput: string | number,
  widthInput: string | number,
  unit: LengthUnit = "ft"
): PlotCalculationResult {
  const parsedLength = parsePlotDimension(lengthInput);
  const parsedWidth = parsePlotDimension(widthInput);

  if (!parsedLength.isValid) {
    return {
      isValid: false,
      errorMessage: `Length: ${parsedLength.error}`,
      errorMessageHi: `लंबाई: ${parsedLength.errorHi}`,
      length: 0,
      width: 0,
      unit,
      lengthFt: 0,
      widthFt: 0,
      lengthM: 0,
      widthM: 0,
      areaSqFt: 0,
      perimeter: 0,
      perimeterFt: 0,
      perimeterM: 0,
      aspectRatio: 1,
      breakdown: {
        sqFt: 0,
        sqM: 0,
        sqYd: 0,
        acre: 0,
        hectare: 0,
        gunthaMH: 0,
        bighaUPPucca: 0,
        bighaWB: 0,
        cent: 0,
      },
      formula: "",
    };
  }

  if (!parsedWidth.isValid) {
    return {
      isValid: false,
      errorMessage: `Width: ${parsedWidth.error}`,
      errorMessageHi: `चौड़ाई: ${parsedWidth.errorHi}`,
      length: parsedLength.value,
      width: 0,
      unit,
      lengthFt: 0,
      widthFt: 0,
      lengthM: 0,
      widthM: 0,
      areaSqFt: 0,
      perimeter: 0,
      perimeterFt: 0,
      perimeterM: 0,
      aspectRatio: 1,
      breakdown: {
        sqFt: 0,
        sqM: 0,
        sqYd: 0,
        acre: 0,
        hectare: 0,
        gunthaMH: 0,
        bighaUPPucca: 0,
        bighaWB: 0,
        cent: 0,
      },
      formula: "",
    };
  }

  const length = parsedLength.value;
  const width = parsedWidth.value;

  const unitOpt = LENGTH_UNITS.find((u) => u.id === unit) || LENGTH_UNITS[0];
  const toFeet = unitOpt.toFeetFactor;

  const lengthFt = length * toFeet;
  const widthFt = width * toFeet;

  const lengthM = lengthFt * 0.3048;
  const widthM = widthFt * 0.3048;

  // Rectangular Area calculation
  const areaSqFt = lengthFt * widthFt;
  const areaSqM = lengthM * widthM;
  const areaSqYd = areaSqFt / 9;
  const areaAcre = areaSqFt / 43560;
  const areaHectare = areaSqM / 10000;
  const gunthaMH = areaSqFt / 1089;
  const bighaUPPucca = areaSqFt / 27225;
  const bighaWB = areaSqFt / 14400;
  const cent = areaSqFt / 435.6;

  // Perimeter calculation: 2 * (L + W)
  const perimeter = 2 * (length + width);
  const perimeterFt = 2 * (lengthFt + widthFt);
  const perimeterM = 2 * (lengthM + widthM);

  const aspectRatio = width > 0 && length > 0 ? length / width : 1;

  const unitSym = unitOpt.symbol;
  const formula = `Area = Length (${length} ${unitSym}) × Width (${width} ${unitSym}) = ${(length * width).toLocaleString("en-IN", { maximumFractionDigits: 4 })} sq ${unitSym}`;

  return {
    isValid: true,
    length,
    width,
    unit,
    lengthFt,
    widthFt,
    lengthM,
    widthM,
    areaSqFt,
    perimeter,
    perimeterFt,
    perimeterM,
    aspectRatio,
    breakdown: {
      sqFt: areaSqFt,
      sqM: areaSqM,
      sqYd: areaSqYd,
      acre: areaAcre,
      hectare: areaHectare,
      gunthaMH,
      bighaUPPucca,
      bighaWB,
      cent,
    },
    formula,
  };
}
