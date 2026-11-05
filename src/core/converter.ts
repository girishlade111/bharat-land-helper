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

  // Check if warning is warranted (e.g. comparing different state regional units)
  let warning: string | undefined;
  if (
    fromUnit.category === "regional" &&
    toUnit.category === "regional" &&
    fromUnit.regionCode !== toUnit.regionCode &&
    fromUnit.regionCode !== "ALL" &&
    toUnit.regionCode !== "ALL"
  ) {
    warning = `Notice: Converting between ${fromUnit.regionName || fromUnit.regionCode} and ${toUnit.regionName || toUnit.regionCode} customary units. Traditional units vary by locality; verify with local revenue office before registration.`;
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
    confidence:
      fromUnit.provenance.confidence === "OFFICIAL_STANDARD" &&
      toUnit.provenance.confidence === "OFFICIAL_STANDARD"
        ? "OFFICIAL_STANDARD"
        : "WIDELY_USED_CUSTOMARY",
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
 * Computes land valuation based on area and rate per unit.
 */
export function calculateLandValuation(
  areaValue: number,
  fromUnit: LandUnit,
  ratePerUnit: number,
  rateUnit: LandUnit,
): RateCalculationResult {
  if (areaValue <= 0 || ratePerUnit <= 0) {
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

