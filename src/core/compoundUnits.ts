// src/core/compoundUnits.ts
// Compound Traditional Land Measurement Engine for Bharat Land Converter
// Pure mathematical calculations for mixed subunit land records (e.g. Bigha + Biswa, Kanal + Marla)

export interface SubunitTier {
  id: string;
  name: string;
  nameHi: string;
  symbol: string;
  sqFt: number; // exact sq ft equivalent of 1 subunit
  ratioToParent?: number; // e.g. 20 (meaning 20 of this unit = 1 parent unit)
}

export interface CompoundSystem {
  id: string;
  name: string;
  nameHi: string;
  stateCode: string;
  stateName: string;
  subunits: SubunitTier[];
  statutoryReference: string;
  notes: string;
  notesHi: string;
}

export const COMPOUND_SYSTEMS: CompoundSystem[] = [
  {
    id: "up_pucca",
    name: "Uttar Pradesh — Pucca Bigha System",
    nameHi: "उत्तर प्रदेश — पक्का बीघा प्रणाली",
    stateCode: "UP",
    stateName: "Uttar Pradesh",
    statutoryReference: "Uttar Pradesh Revenue Code, 2006 (UP Act No. 8 of 2012)",
    notes: "1 Pucca Bigha = 20 Biswa = 400 Biswansi = 27,225 sq ft (Gatha = 99 inches)",
    notesHi: "1 पक्का बीघा = 20 बिस्वा = 400 बिस्वांसी = 27,225 वर्ग फीट (गट्ठा = 99 इंच)",
    subunits: [
      { id: "bigha", name: "Pucca Bigha", nameHi: "पक्का बीघा", symbol: "Bigha", sqFt: 27225 },
      { id: "biswa", name: "Biswa", nameHi: "बिस्वा", symbol: "Biswa", sqFt: 1361.25, ratioToParent: 20 },
      { id: "biswansi", name: "Biswansi", nameHi: "बिस्वांसी", symbol: "Biswansi", sqFt: 68.0625, ratioToParent: 20 },
    ],
  },
  {
    id: "up_kaccha",
    name: "Uttar Pradesh — Western Kaccha Bigha",
    nameHi: "उत्तर प्रदेश — कच्चा बीघा (पश्चिमी उप्र)",
    stateCode: "UP",
    stateName: "Uttar Pradesh",
    statutoryReference: "UP Board of Revenue Settlement Records (Meerut, Muzaffarnagar, Saharanpur)",
    notes: "1 Kaccha Bigha = 1/3 Pucca Bigha = 9,075 sq ft (20 Biswa Kaccha)",
    notesHi: "1 कच्चा बीघा = 1/3 पक्का बीघा = 9,075 वर्ग फीट (20 बिस्वा कच्चा)",
    subunits: [
      { id: "bigha_kaccha", name: "Kaccha Bigha", nameHi: "कच्चा बीघा", symbol: "Bigha (K)", sqFt: 9075 },
      { id: "biswa_kaccha", name: "Biswa (Kaccha)", nameHi: "बिस्वा (कच्चा)", symbol: "Biswa (K)", sqFt: 453.75, ratioToParent: 20 },
      { id: "biswansi_kaccha", name: "Biswansi (Kaccha)", nameHi: "बिस्वांसी (कच्चा)", symbol: "Biswansi (K)", sqFt: 22.6875, ratioToParent: 20 },
    ],
  },
  {
    id: "bihar_std",
    name: "Bihar — Standard 5.5-Haath Lagga System",
    nameHi: "बिहार — मानक 5.5 हाथ लग्गी प्रणाली",
    stateCode: "BR",
    stateName: "Bihar",
    statutoryReference: "Bihar Cadastral Survey & Settlement Manual",
    notes: "1 Bigha = 20 Kattha = 400 Dhur = 27,225 sq ft (Lagga = 8.25 ft)",
    notesHi: "1 बीघा = 20 कट्ठा = 400 धुर = 27,225 वर्ग फीट (लग्गी = 8.25 फीट)",
    subunits: [
      { id: "bigha_br", name: "Bigha (Std)", nameHi: "बीघा (मानक)", symbol: "Bigha", sqFt: 27225 },
      { id: "kattha_br", name: "Kattha", nameHi: "कट्ठा", symbol: "Kattha", sqFt: 1361.25, ratioToParent: 20 },
      { id: "dhur_br", name: "Dhur", nameHi: "धुर", symbol: "Dhur", sqFt: 68.0625, ratioToParent: 20 },
      { id: "dhurki_br", name: "Dhurki", nameHi: "धुरकी", symbol: "Dhurki", sqFt: 3.403125, ratioToParent: 20 },
    ],
  },
  {
    id: "bihar_6haath",
    name: "Bihar — North Bihar 6.0-Haath Lagga (Tirhut/Mithila)",
    nameHi: "बिहार — उत्तर बिहार 6.0 हाथ लग्गी (मिथिला)",
    stateCode: "BR",
    stateName: "Bihar",
    statutoryReference: "Tirhut Settlement Operations Report (Darbhanga, Madhubani, Samastipur)",
    notes: "1 Bigha = 20 Kattha = 400 Dhur = 32,400 sq ft (Lagga = 9 ft; 1 Dhur = 81 sq ft)",
    notesHi: "1 बीघा = 20 कट्ठा = 400 धुर = 32,400 वर्ग फीट (लग्गी = 9 फीट; 1 धुर = 81 वर्ग फीट)",
    subunits: [
      { id: "bigha_br6", name: "Bigha (6.0-Haath)", nameHi: "बीघा (6.0 हाथ)", symbol: "Bigha", sqFt: 32400 },
      { id: "kattha_br6", name: "Kattha (6.0-Haath)", nameHi: "कट्ठा (6.0 हाथ)", symbol: "Kattha", sqFt: 1620, ratioToParent: 20 },
      { id: "dhur_br6", name: "Dhur (6.0-Haath)", nameHi: "धुर (6.0 हाथ)", symbol: "Dhur", sqFt: 81, ratioToParent: 20 },
    ],
  },
  {
    id: "wb_bengal",
    name: "West Bengal — Bengal Revenue System",
    nameHi: "पश्चिम बंगाल — बंगाल राजस्व प्रणाली",
    stateCode: "WB",
    stateName: "West Bengal",
    statutoryReference: "West Bengal Land Reforms Act, 1955 (Banglarbhumi Cadastral Standard)",
    notes: "1 Bigha = 20 Kattha = 320 Chatak = 14,400 sq ft (1 Kattha = 720 sq ft, 1 Chatak = 45 sq ft)",
    notesHi: "1 बीघा = 20 कट्ठा = 320 छटाक = 14,400 वर्ग फीट (1 कट्ठा = 720 वर्ग फीट, 1 छटाक = 45 वर्ग फीट)",
    subunits: [
      { id: "bigha_wb", name: "Bigha", nameHi: "बीघा", symbol: "Bigha", sqFt: 14400 },
      { id: "kattha_wb", name: "Kattha", nameHi: "कट्ठा", symbol: "Kattha", sqFt: 720, ratioToParent: 20 },
      { id: "chatak_wb", name: "Chatak", nameHi: "छटाक", symbol: "Chatak", sqFt: 45, ratioToParent: 16 },
    ],
  },
  {
    id: "punjab_killa",
    name: "Punjab & Haryana — Kanal-Marla System",
    nameHi: "पंजाब व हरियाणा — कनाल-मरला प्रणाली",
    stateCode: "PB",
    stateName: "Punjab & Haryana",
    statutoryReference: "Punjab Land Revenue Act, 1887 & Jamabandi Cadastral Standard",
    notes: "1 Killa (Acre) = 8 Kanal = 160 Marla = 1,440 Sarsahi = 43,560 sq ft (Standard Karam = 66 in)",
    notesHi: "1 किल्ला (एकड़) = 8 कनाल = 160 मरला = 1,440 सरसाही = 43,560 वर्ग फीट",
    subunits: [
      { id: "killa_pb", name: "Killa / Ghumaon (Acre)", nameHi: "किल्ला / एकड़", symbol: "Killa", sqFt: 43560 },
      { id: "kanal_pb", name: "Kanal", nameHi: "कनाल", symbol: "Kanal", sqFt: 5445, ratioToParent: 8 },
      { id: "marla_pb", name: "Marla", nameHi: "मरला", symbol: "Marla", sqFt: 272.25, ratioToParent: 20 },
      { id: "sarsahi_pb", name: "Sarsahi", nameHi: "सरसाही", symbol: "Sarsahi", sqFt: 30.25, ratioToParent: 9 },
    ],
  },
  {
    id: "mh_acre_guntha",
    name: "Maharashtra — Acre-Guntha System",
    nameHi: "महाराष्ट्र — एकड़-गुंठा प्रणाली",
    stateCode: "MH",
    stateName: "Maharashtra",
    statutoryReference: "Maharashtra Land Revenue Code, 1966 (Act No. XLI of 1966)",
    notes: "1 Acre = 40 Guntha = 1,600 Prat = 43,560 sq ft (1 Guntha = 33 ft × 33 ft = 1,089 sq ft)",
    notesHi: "1 एकड़ = 40 गुंठा = 43,560 वर्ग फीट (1 गुंठा = 33 फीट × 33 फीट = 1,089 वर्ग फीट)",
    subunits: [
      { id: "acre_mh", name: "Acre", nameHi: "एकड़", symbol: "Acre", sqFt: 43560 },
      { id: "guntha_mh", name: "Guntha", nameHi: "गुंठा", symbol: "Guntha", sqFt: 1089, ratioToParent: 40 },
    ],
  },
  {
    id: "hp_bigha",
    name: "Himachal Pradesh — Hill Bigha System",
    nameHi: "हिमाचल प्रदेश — पहाड़ी बीघा प्रणाली",
    stateCode: "HP",
    stateName: "Himachal Pradesh",
    statutoryReference: "Himachal Pradesh Land Records Manual",
    notes: "1 Bigha = 20 Biswa = 400 Biswansi = 8,712 sq ft (Exactly 1/5 Acre)",
    notesHi: "1 बीघा = 20 बिस्वा = 400 बिस्वांसी = 8,712 वर्ग फीट (ठीक 1/5 एकड़)",
    subunits: [
      { id: "bigha_hp", name: "Bigha (HP)", nameHi: "बीघा", symbol: "Bigha", sqFt: 8712 },
      { id: "biswa_hp", name: "Biswa (HP)", nameHi: "बिस्वा", symbol: "Biswa", sqFt: 435.6, ratioToParent: 20 },
      { id: "biswansi_hp", name: "Biswansi (HP)", nameHi: "बिस्वांसी", symbol: "Biswansi", sqFt: 21.78, ratioToParent: 20 },
    ],
  },
];

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
 * e.g. 0, 20, 20.5, 0.0001, .5, 1e-4, 2.5E3
 */
const STRICT_NUMBER_REGEX = /^\+?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/;

export interface StrictQuantityResult {
  isValid: boolean;
  value: number;
  isEmpty?: boolean;
  error?: string;
  errorHi?: string;
}

/**
 * Strictly parses and validates a compound unit quantity or reverse area input.
 * Allows valid 0, positive integers and decimals, and properly formatted commas.
 * Rejects partial strings (e.g. '3/4', '20.000.50', '100abc'), malformed comma groups ('1,2,3'),
 * negative numbers, NaN, and Infinity.
 */
export function parseStrictCompoundQuantity(
  input: string | number | null | undefined,
  maxBound: number = 10_000_000_000
): StrictQuantityResult {
  if (input === null || input === undefined) {
    return { isValid: true, value: 0, isEmpty: true };
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
        error: "Quantity cannot be negative.",
        errorHi: "मात्रा ऋणात्मक नहीं हो सकती।",
      };
    }
    if (input > maxBound) {
      return {
        isValid: false,
        value: 0,
        error: `Quantity exceeds maximum allowable limit (${maxBound.toLocaleString("en-IN")}).`,
        errorHi: `मात्रा अधिकतम स्वीकार्य सीमा (${maxBound.toLocaleString("en-IN")}) से अधिक है।`,
      };
    }
    return { isValid: true, value: input, isEmpty: false };
  }

  const rawStr = String(input);
  const trimmed = rawStr.trim();
  if (trimmed === "") {
    return { isValid: true, value: 0, isEmpty: true };
  }

  if (trimmed.startsWith("-")) {
    return {
      isValid: false,
      value: 0,
      error: "Quantity cannot be negative.",
      errorHi: "मात्रा ऋणात्मक नहीं हो सकती।",
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
      error: "Please enter a valid non-negative number.",
      errorHi: "कृपया एक मान्य गैर-ऋणात्मक संख्या दर्ज करें।",
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
      error: "Quantity cannot be negative.",
      errorHi: "मात्रा ऋणात्मक नहीं हो सकती।",
    };
  }

  if (num > maxBound) {
    return {
      isValid: false,
      value: 0,
      error: `Quantity exceeds maximum allowable limit (${maxBound.toLocaleString("en-IN")}).`,
      errorHi: `मात्रा अधिकतम स्वीकार्य सीमा (${maxBound.toLocaleString("en-IN")}) से अधिक है।`,
    };
  }

  return { isValid: true, value: num, isEmpty: false };
}

export interface CompoundCalculationResult {
  system: CompoundSystem;
  values: Record<string, number>;
  totalSqFt: number;
  totalSqM: number;
  totalSqYd: number;
  totalAcre: number;
  totalHectare: number;
  stepBreakdown: { unitName: string; count: number; unitSqFt: number; subtotalSqFt: number }[];
  formula: string;
  isValid: boolean;
  errors?: Record<string, string>;
  errorsHi?: Record<string, string>;
  firstError?: string;
  firstErrorHi?: string;
}

export function calculateCompoundArea(
  systemId: string,
  rawValues: Record<string, string | number>
): CompoundCalculationResult {
  const system = COMPOUND_SYSTEMS.find((s) => s.id === systemId) || COMPOUND_SYSTEMS[0];

  let totalSqFt = 0;
  let hasErrors = false;
  let firstError: string | undefined;
  let firstErrorHi: string | undefined;
  const errors: Record<string, string> = {};
  const errorsHi: Record<string, string> = {};
  const values: Record<string, number> = {};
  const stepBreakdown: { unitName: string; count: number; unitSqFt: number; subtotalSqFt: number }[] = [];
  const formulaParts: string[] = [];

  for (const subunit of system.subunits) {
    const raw = rawValues[subunit.id];
    const parsed = parseStrictCompoundQuantity(raw);

    if (!parsed.isValid) {
      hasErrors = true;
      errors[subunit.id] = parsed.error || "Invalid quantity";
      errorsHi[subunit.id] = parsed.errorHi || "अमान्य मात्रा";
      if (!firstError) {
        firstError = parsed.error;
        firstErrorHi = parsed.errorHi;
      }
      values[subunit.id] = 0;
    } else {
      values[subunit.id] = parsed.value;
      const subtotal = parsed.value * subunit.sqFt;
      totalSqFt += subtotal;

      if (parsed.value > 0) {
        stepBreakdown.push({
          unitName: subunit.name,
          count: parsed.value,
          unitSqFt: subunit.sqFt,
          subtotalSqFt: subtotal,
        });
        formulaParts.push(`(${parsed.value} ${subunit.symbol} × ${subunit.sqFt.toLocaleString("en-IN")} sq ft)`);
      }
    }
  }

  if (hasErrors) {
    return {
      system,
      values,
      totalSqFt: 0,
      totalSqM: 0,
      totalSqYd: 0,
      totalAcre: 0,
      totalHectare: 0,
      stepBreakdown: [],
      formula: "Invalid subunit input",
      isValid: false,
      errors,
      errorsHi,
      firstError,
      firstErrorHi,
    };
  }

  const formula = formulaParts.length > 0 ? formulaParts.join(" + ") : "0 sq ft";

  return {
    system,
    values,
    totalSqFt,
    totalSqM: totalSqFt * 0.09290304,
    totalSqYd: totalSqFt / 9,
    totalAcre: totalSqFt / 43560,
    totalHectare: (totalSqFt * 0.09290304) / 10000,
    stepBreakdown,
    formula,
    isValid: true,
  };
}

/**
 * Reverse decomposition: Decomposes a given area in square feet into compound subunits.
 * e.g., 60,000 sq ft in UP Pucca Bigha -> 2 Bigha, 4 Biswa, 2.35 Biswansi
 */
export function decomposeAreaIntoSystem(
  systemId: string,
  totalSqFt: number | string
): { subunitId: string; subunitName: string; count: number; remainderSqFt: number }[] {
  const system = COMPOUND_SYSTEMS.find((s) => s.id === systemId) || COMPOUND_SYSTEMS[0];
  const results: { subunitId: string; subunitName: string; count: number; remainderSqFt: number }[] = [];

  let safeTotal = 0;
  if (typeof totalSqFt === "string") {
    const parsed = parseStrictCompoundQuantity(totalSqFt, 1_000_000_000_000);
    safeTotal = parsed.isValid && parsed.value > 0 ? parsed.value : 0;
  } else if (typeof totalSqFt === "number") {
    safeTotal = isFinite(totalSqFt) && !isNaN(totalSqFt) && totalSqFt > 0 ? totalSqFt : 0;
  }

  let remaining = safeTotal;

  for (let i = 0; i < system.subunits.length; i++) {
    const subunit = system.subunits[i];
    const isSmallest = i === system.subunits.length - 1;

    if (isSmallest) {
      // Smallest subunit takes remaining fractional value
      const count = safeTotal > 0 ? Math.round((remaining / subunit.sqFt) * 1000) / 1000 : 0;
      results.push({
        subunitId: subunit.id,
        subunitName: subunit.name,
        count,
        remainderSqFt: 0,
      });
    } else {
      const count = safeTotal > 0 ? Math.floor(remaining / subunit.sqFt) : 0;
      remaining = remaining - count * subunit.sqFt;
      results.push({
        subunitId: subunit.id,
        subunitName: subunit.name,
        count,
        remainderSqFt: remaining,
      });
    }
  }

  return results;
}

