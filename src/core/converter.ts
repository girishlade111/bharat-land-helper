import type {
  LandUnit,
  ConversionResult,
  OneToAllResult,
  OneToAllItem,
  ConversionContext,
} from "./types";
import { formatIndianNumber } from "./formatter";
import { resolveUnit } from "./units";

export interface RateCalculationResult {
  totalValue: number;
  formattedCurrency: string;
  wordsEn: string;
  wordsHi: string;
  equivalentUnits: number;
  calculationBreakdown: string;
}

/**
 * Converts a numerical area value from one LandUnit or Unit ID to another.
 * Pure mathematical function: zero DOM dependencies, zero side-effects.
 * Supports explicit ConversionContext for state-specific and variant-specific resolution.
 */
export function convertArea(
  value: number,
  fromUnitOrId: LandUnit | string,
  toUnitOrId: LandUnit | string,
  optionsOrPrecision: number | { precision?: number; context?: ConversionContext } = 4,
): ConversionResult {
  if (value < 0) {
    throw new Error("Physical land area cannot be negative");
  }

  const precision =
    typeof optionsOrPrecision === "number"
      ? optionsOrPrecision
      : optionsOrPrecision?.precision ?? 4;
  const context =
    typeof optionsOrPrecision === "object"
      ? optionsOrPrecision?.context
      : undefined;

  const fromUnit =
    typeof fromUnitOrId === "string"
      ? resolveUnit(fromUnitOrId, context)
      : fromUnitOrId;
  const toUnit =
    typeof toUnitOrId === "string"
      ? resolveUnit(toUnitOrId, context)
      : toUnitOrId;

  if (!fromUnit) {
    throw new Error(`Source unit '${String(fromUnitOrId)}' could not be resolved`);
  }
  if (!toUnit) {
    throw new Error(`Target unit '${String(toUnitOrId)}' could not be resolved`);
  }

  // Handle same unit identity conversion
  if (fromUnit.id === toUnit.id) {
    return {
      fromUnit,
      toUnit,
      inputValue: value,
      rawResult: value,
      formattedResult: formatIndianNumber(value, { maxDecimals: precision }),
      formula: `1 ${fromUnit.name} = 1 ${toUnit.name}`,
      stepCalculation: `${formatIndianNumber(value)} ${fromUnit.name} = ${formatIndianNumber(value)} ${toUnit.name}`,
      isSameUnit: true,
      confidence: fromUnit.provenance.confidence,
    };
  }

  // Handle zero
  if (value === 0) {
    return {
      fromUnit,
      toUnit,
      inputValue: 0,
      rawResult: 0,
      formattedResult: "0",
      formula: `1 ${fromUnit.name} = ${(fromUnit.sqFt / toUnit.sqFt).toFixed(6).replace(/\.?0+$/, "")} ${toUnit.name}`,
      stepCalculation: `0 ${fromUnit.name} = 0 ${toUnit.name}`,
      isSameUnit: false,
      confidence: fromUnit.provenance.confidence,
    };
  }

  // Calculate canonical area
  // Use sqFt ratio for customary units to avoid metric float conversion loss
  const factor = fromUnit.sqFt / toUnit.sqFt;
  const rawResult = value * factor;

  // Format result
  const formattedResult = formatIndianNumber(rawResult, { maxDecimals: precision });

  // Build formula display
  const singleFactorFormatted = formatIndianNumber(factor, { maxDecimals: 6 });
  const formula = `1 ${fromUnit.name} = ${singleFactorFormatted} ${toUnit.name}`;

  // Build step-by-step breakdown
  const stepCalculation = `${formatIndianNumber(value)} ${fromUnit.name} × ${fromUnit.sqFt} sq ft ÷ ${toUnit.sqFt} sq ft = ${formattedResult} ${toUnit.name}`;

  // Check if warning is warranted (e.g. custom user factors or inter-state customary units)
  let warning: string | undefined;
  if (fromUnit.regionCode === "CUSTOM" || toUnit.regionCode === "CUSTOM") {
    warning = "Notice: Calculating using user-defined custom measurement factor. This is a private, unverified definition and is not recognized by government revenue departments.";
  } else if (
    fromUnit.category === "regional" &&
    toUnit.category === "regional" &&
    fromUnit.regionCode !== toUnit.regionCode &&
    fromUnit.regionCode !== "ALL" &&
    toUnit.regionCode !== "ALL"
  ) {
    warning = `Notice: Converting between ${fromUnit.regionName || fromUnit.regionCode} and ${toUnit.regionName || toUnit.regionCode} customary units. Traditional units vary by locality; verify with local revenue office before registration.`;
  }

  let confidence = fromUnit.provenance.confidence;
  if (fromUnit.provenance.confidence === "CUSTOMARY_UNOFFICIAL" || toUnit.provenance.confidence === "CUSTOMARY_UNOFFICIAL") {
    confidence = "CUSTOMARY_UNOFFICIAL";
  } else if (fromUnit.provenance.confidence === "OFFICIAL_STANDARD" && toUnit.provenance.confidence === "OFFICIAL_STANDARD") {
    confidence = "OFFICIAL_STANDARD";
  } else {
    confidence = "WIDELY_USED_CUSTOMARY";
  }

  return {
    fromUnit,
    toUnit,
    inputValue: value,
    rawResult,
    formattedResult,
    formula,
    stepCalculation,
    isSameUnit: false,
    warning,
    confidence,
  };
}

/**
 * Converts a given input area into all available units in a single batch.
 */
export function convertOneToAll(
  value: number,
  fromUnit: LandUnit,
  availableUnits: LandUnit[],
  precision: number = 4,
): OneToAllResult {
  const results: OneToAllItem[] = availableUnits.map((targetUnit) => {
    const isSame = targetUnit.id === fromUnit.id;
    if (value <= 0) {
      return {
        unit: targetUnit,
        rawResult: 0,
        formattedResult: "0",
        isSameUnit: isSame,
      };
    }

    const factor = fromUnit.sqFt / targetUnit.sqFt;
    const rawResult = value * factor;
    const formattedResult = formatIndianNumber(rawResult, { maxDecimals: precision });

    return {
      unit: targetUnit,
      rawResult,
      formattedResult,
      isSameUnit: isSame,
    };
  });

  return {
    fromUnit,
    inputValue: value,
    results,
  };
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
 * Strict regex for plain non-negative decimal number or scientific notation:
 * e.g. 0, 5000, 5000.75, 0.0001, .5, 1e-4, 2.5E3
 */
const STRICT_NUMBER_REGEX = /^\+?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/;

export interface StrictRateResult {
  isValid: boolean;
  value: number;
  isEmpty?: boolean;
  error?: string;
  errorHi?: string;
}

/**
 * Strictly parses and validates a property valuation rate per unit.
 * Allows valid positive integers, decimals, 0, and properly formatted commas.
 * Rejects partial strings (e.g. '3/4', '20.000.50', '5000abc'), malformed comma groups ('1,2,3'),
 * negative numbers, NaN, and Infinity.
 */
export function parseStrictRate(
  input: string | number | null | undefined,
  maxBound: number = 1_000_000_000_000 // ₹ 1 trillion per unit max bound
): StrictRateResult {
  if (input === null || input === undefined) {
    return {
      isValid: false,
      value: 0,
      isEmpty: true,
      error: "Please enter a valid numeric rate.",
      errorHi: "कृपया एक मान्य संख्यात्मक दर दर्ज करें।",
    };
  }

  if (typeof input === "number") {
    if (isNaN(input) || !isFinite(input)) {
      return {
        isValid: false,
        value: 0,
        error: "Please enter a valid finite number.",
        errorHi: "कृपया एक मान्य परिमित संख्या दर्ज करें।",
      };
    }
    if (input < 0) {
      return {
        isValid: false,
        value: 0,
        error: "Rate cannot be negative.",
        errorHi: "दर ऋणात्मक नहीं हो सकती।",
      };
    }
    if (input > maxBound) {
      return {
        isValid: false,
        value: 0,
        error: `Rate exceeds maximum allowable limit (₹ ${maxBound.toLocaleString("en-IN")}).`,
        errorHi: `दर अधिकतम स्वीकार्य सीमा (₹ ${maxBound.toLocaleString("en-IN")}) से अधिक है।`,
      };
    }
    return { isValid: true, value: input, isEmpty: false };
  }

  const rawStr = String(input);
  const trimmed = rawStr.trim();
  if (trimmed === "") {
    return {
      isValid: false,
      value: 0,
      isEmpty: true,
      error: "Please enter a valid numeric rate.",
      errorHi: "कृपया एक मान्य संख्यात्मक दर दर्ज करें।",
    };
  }

  if (trimmed.startsWith("-")) {
    return {
      isValid: false,
      value: 0,
      error: "Rate cannot be negative.",
      errorHi: "दर ऋणात्मक नहीं हो सकती।",
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
      error: "Please enter a valid numeric rate.",
      errorHi: "कृपया एक मान्य संख्यात्मक दर दर्ज करें।",
    };
  }

  const num = Number(sanitized);
  if (isNaN(num) || !isFinite(num)) {
    return {
      isValid: false,
      value: 0,
      error: "Please enter a valid finite number.",
      errorHi: "कृपया एक मान्य परिमित संख्या दर्ज करें।",
    };
  }

  if (num < 0) {
    return {
      isValid: false,
      value: 0,
      error: "Rate cannot be negative.",
      errorHi: "दर ऋणात्मक नहीं हो सकती।",
    };
  }

  if (num > maxBound) {
    return {
      isValid: false,
      value: 0,
      error: `Rate exceeds maximum allowable limit (₹ ${maxBound.toLocaleString("en-IN")}).`,
      errorHi: `दर अधिकतम स्वीकार्य सीमा (₹ ${maxBound.toLocaleString("en-IN")}) से अधिक है।`,
    };
  }

  return { isValid: true, value: num, isEmpty: false };
}

/**
 * Computes land valuation based on area and rate per unit.
 */
export function calculateLandValuation(
  areaValue: number,
  fromUnit: LandUnit,
  ratePerUnit: number,
  rateUnit: LandUnit,
): RateCalculationResult {
  // Validate units
  if (
    !fromUnit ||
    typeof fromUnit.sqFt !== "number" ||
    !isFinite(fromUnit.sqFt) ||
    fromUnit.sqFt <= 0 ||
    !rateUnit ||
    typeof rateUnit.sqFt !== "number" ||
    !isFinite(rateUnit.sqFt) ||
    rateUnit.sqFt <= 0
  ) {
    return {
      totalValue: 0,
      formattedCurrency: "₹ 0",
      wordsEn: "Zero Rupees",
      wordsHi: "शून्य रुपये",
      equivalentUnits: 0,
      calculationBreakdown: "Invalid unit configuration",
    };
  }

  // Validate area & rate
  if (
    typeof areaValue !== "number" ||
    isNaN(areaValue) ||
    !isFinite(areaValue) ||
    areaValue < 0 ||
    typeof ratePerUnit !== "number" ||
    isNaN(ratePerUnit) ||
    !isFinite(ratePerUnit) ||
    ratePerUnit < 0
  ) {
    return {
      totalValue: 0,
      formattedCurrency: "₹ 0",
      wordsEn: "Zero Rupees",
      wordsHi: "शून्य रुपये",
      equivalentUnits: 0,
      calculationBreakdown: "Invalid area or rate",
    };
  }

  if (areaValue === 0 || ratePerUnit === 0) {
    return {
      totalValue: 0,
      formattedCurrency: "₹ 0",
      wordsEn: "Zero Rupees",
      wordsHi: "शून्य रुपये",
      equivalentUnits: 0,
      calculationBreakdown: "Enter area and rate to calculate value",
    };
  }

  // Convert area into rate units
  const equivalentUnits = (areaValue * fromUnit.sqFt) / rateUnit.sqFt;
  const totalValue = equivalentUnits * ratePerUnit;

  if (!isFinite(equivalentUnits) || !isFinite(totalValue) || totalValue > 1e16) {
    return {
      totalValue: 0,
      formattedCurrency: "₹ 0",
      wordsEn: "Value exceeds supported limits",
      wordsHi: "मूल्य समर्थित सीमा से अधिक है",
      equivalentUnits: 0,
      calculationBreakdown: "Calculated value exceeds maximum limits",
    };
  }

  const formattedCurrency = "₹ " + formatIndianNumber(totalValue, { maxDecimals: 2 });
  
  let wordsEn = "";
  let wordsHi = "";
  if (totalValue >= 1e7) {
    const v = (totalValue / 1e7).toFixed(2).replace(/\.?0+$/, "");
    wordsEn = `₹ ${v} Crore`;
    wordsHi = `₹ ${v} करोड़`;
  } else if (totalValue >= 1e5) {
    const v = (totalValue / 1e5).toFixed(2).replace(/\.?0+$/, "");
    wordsEn = `₹ ${v} Lakh`;
    wordsHi = `₹ ${v} लाख`;
  } else if (totalValue >= 1e3) {
    const v = (totalValue / 1e3).toFixed(2).replace(/\.?0+$/, "");
    wordsEn = `₹ ${v} Thousand`;
    wordsHi = `₹ ${v} हज़ार`;
  } else {
    wordsEn = formattedCurrency;
    wordsHi = formattedCurrency;
  }

  const breakdown = `${formatIndianNumber(areaValue)} ${fromUnit.name} = ${formatIndianNumber(equivalentUnits, { maxDecimals: 3 })} ${rateUnit.name} × ₹ ${formatIndianNumber(ratePerUnit)} = ${formattedCurrency}`;

  return {
    totalValue,
    formattedCurrency,
    wordsEn,
    wordsHi,
    equivalentUnits,
    calculationBreakdown: breakdown,
  };
}

