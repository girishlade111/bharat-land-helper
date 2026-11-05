export interface NumberFormatOptions {
  minDecimals?: number;
  maxDecimals?: number;
  preserveTrailingZeros?: boolean;
}

/**
 * Formats a numeric value according to the Indian numbering system (Lakh/Crore grouping).
 * Crucially preserves decimal precision for all values (does NOT truncate values >= 100).
 */
export function formatIndianNumber(
  num: number,
  options: NumberFormatOptions = {},
): string {
  if (isNaN(num) || !isFinite(num)) {
    return "0";
  }

  const {
    minDecimals = 0,
    maxDecimals = 4,
    preserveTrailingZeros = false,
  } = options;

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  if (absNum === 0) {
    if (minDecimals > 0) {
      return "0." + "0".repeat(minDecimals);
    }
    return "0";
  }

  // Handle scientific notation string conversions if any
  let fixedStr: string;
  if (absNum < 0.0001) {
    fixedStr = absNum.toFixed(Math.max(6, maxDecimals));
  } else {
    fixedStr = absNum.toFixed(maxDecimals);
  }

  // Trim trailing zeros from decimals unless preserveTrailingZeros is true
  const [intPartStr, rawDecPartStr = ""] = fixedStr.split(".");
  let decPart = rawDecPartStr;

  if (!preserveTrailingZeros) {
    decPart = decPart.replace(/0+$/, "");
  }

  // Enforce minDecimals if needed
  if (decPart.length < minDecimals) {
    decPart = decPart.padEnd(minDecimals, "0");
  }

  // Apply Indian comma grouping to integer part
  // e.g. 1234567 -> last 3 digits "567", remaining "1234" grouped by 2 -> "12,34,567"
  let formattedInt: string;
  if (intPartStr.length <= 3) {
    formattedInt = intPartStr;
  } else {
    const lastThree = intPartStr.slice(-3);
    const leading = intPartStr.slice(0, -3);
    const groupedLeading = leading.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    formattedInt = `${groupedLeading},${lastThree}`;
  }

  const result = decPart.length > 0 ? `${formattedInt}.${decPart}` : formattedInt;
  return isNegative ? `-${result}` : result;
}

/**
 * Parses user input string into a valid number.
 * Removes Indian commas, spaces, and validates format.
 */
export function parseAreaInput(rawInput: string): {
  isValid: boolean;
  value: number;
  errorMessage?: string;
  errorMessageHi?: string;
} {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      isValid: false,
      value: 0,
      errorMessage: "Please enter an area value",
      errorMessageHi: "कृपया क्षेत्रफल मान दर्ज करें",
    };
  }

  // Remove commas and spaces
  const sanitized = trimmed.replace(/,/g, "").replace(/\s+/g, "");

  // Check for valid decimal pattern
  if (!/^-?\d*(\.\d+)?$/.test(sanitized) || sanitized === "-" || sanitized === ".") {
    return {
      isValid: false,
      value: 0,
      errorMessage: "Invalid number format",
      errorMessageHi: "अमान्य संख्या प्रारूप",
    };
  }

  const parsed = parseFloat(sanitized);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return {
      isValid: false,
      value: 0,
      errorMessage: "Invalid numeric value",
      errorMessageHi: "अमान्य संख्या मान",
    };
  }

  if (parsed < 0) {
    return {
      isValid: false,
      value: parsed,
      errorMessage: "Physical land area cannot be negative",
      errorMessageHi: "भूमि का क्षेत्रफल ऋणात्मक नहीं हो सकता",
    };
  }

  return {
    isValid: true,
    value: parsed,
  };
}

/**
 * Formats monetary land values in Indian Rupees (₹) with Lakh and Crore words.
 * Returns both English and Hindi word representations.
 */
export function formatIndianCurrency(amount: number): {
  formatted: string;
  wordsEn: string;
  wordsHi: string;
} {
  if (isNaN(amount) || !isFinite(amount) || amount <= 0) {
    return {
      formatted: "₹ 0",
      wordsEn: "Zero Rupees",
      wordsHi: "शून्य रुपये",
    };
  }

  const formatted = "₹ " + formatIndianNumber(amount, { maxDecimals: 2 });
  let wordsEn = "";
  let wordsHi = "";

  if (amount >= 1e7) {
    const val = (amount / 1e7).toFixed(2).replace(/\.?0+$/, "");
    wordsEn = `₹ ${val} Crore`;
    wordsHi = `₹ ${val} करोड़`;
  } else if (amount >= 1e5) {
    const val = (amount / 1e5).toFixed(2).replace(/\.?0+$/, "");
    wordsEn = `₹ ${val} Lakh`;
    wordsHi = `₹ ${val} लाख`;
  } else if (amount >= 1e3) {
    const val = (amount / 1e3).toFixed(2).replace(/\.?0+$/, "");
    wordsEn = `₹ ${val} Thousand`;
    wordsHi = `₹ ${val} हज़ार`;
  } else {
    wordsEn = `₹ ${amount.toFixed(2).replace(/\.?0+$/, "")}`;
    wordsHi = `₹ ${amount.toFixed(2).replace(/\.?0+$/, "")}`;
  }

  return { formatted, wordsEn, wordsHi };
}
