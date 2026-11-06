import type { LandUnit, ConversionContext } from "./types";
import { loadCustomPresets, customPresetToLandUnit, getCustomLandUnits } from "./customUnits";
import { getRegion } from "./regions";
import { LEGACY_UNIT_MAP } from "./legacyUnits";

const SQFT_TO_SQM = 0.09290304; // 1 ft = 0.3048 m exactly -> 0.3048^2 = 0.09290304 m^2
const SQM_TO_SQFT = 1 / SQFT_TO_SQM; // 10.763910416709722 sq ft

export const ALL_UNITS: LandUnit[] = [
  // ==========================================
  // 1. STANDARD & METRIC UNITS (Available Everywhere)
  // ==========================================
  {
    id: "sqft",
    name: "Square Feet (sq ft)",
    nameHi: "वर्ग फीट",
    aliases: ["sq ft", "sqft", "square feet", "feet", "varg feet"],
    category: "standard",
    sqMeters: SQFT_TO_SQM,
    sqFt: 1,
    regionCode: "ALL",
    note: "1 ft × 1 ft (Imperial standard area)",
    noteHi: "1 फीट × 1 फीट (मानक क्षेत्रफल इकाई)",
    provenance: {
      sourceName: "International Yard and Pound Agreement 1959",
      referenceDocument: "NIST Special Publication 811",
      legalStatus: "Standard Imperial / Statutory survey unit",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "sqm",
    name: "Square Meter (sq m)",
    nameHi: "वर्ग मीटर",
    aliases: ["sq m", "sqm", "square meter", "square metre", "varg meter", "m2"],
    category: "standard",
    sqMeters: 1,
    sqFt: SQM_TO_SQFT,
    regionCode: "ALL",
    note: "1 m × 1 m (SI derived unit, official revenue standard)",
    noteHi: "1 मी × 1 मी (अंतरराष्ट्रीय एसआई मात्रक, सरकारी राजस्व मानक)",
    provenance: {
      sourceName: "Standards of Weights and Measures Act (India) 1976",
      referenceDocument: "Legal Metrology Act, 2009",
      legalStatus: "Primary legal statutory measurement unit across India",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "sqyd",
    name: "Square Yard / Gaj (sq yd)",
    nameHi: "वर्ग गज",
    aliases: ["sq yd", "sqyd", "square yard", "gaj", "gaz", "varag gaj"],
    category: "standard",
    sqMeters: 9 * SQFT_TO_SQM,
    sqFt: 9,
    regionCode: "ALL",
    note: "3 ft × 3 ft = 9 sq ft (Commonly used for urban residential plots)",
    noteHi: "3 फीट × 3 फीट = 9 वर्ग फीट (आवासीय प्लॉटों के लिए प्रयुक्त)",
    provenance: {
      sourceName: "Indian Urban Cadastral Standard",
      referenceDocument: "Delhi Development Authority / Urban Local Bodies",
      legalStatus: "Statutory plot measurement unit in urban registries",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "acre",
    name: "Acre",
    nameHi: "एकड़",
    aliases: ["acre", "acres", "ekad", "ekar"],
    category: "standard",
    sqMeters: 43560 * SQFT_TO_SQM, // 4,046.8564224 m^2
    sqFt: 43560,
    regionCode: "ALL",
    note: "43,560 sq ft = 4,840 sq yd = 4,046.8564 sq m = 0.404686 Hectare",
    noteHi: "43,560 वर्ग फीट = 4,840 वर्ग गज = 4,046.8564 वर्ग मीटर = 0.4047 हेक्टेयर",
    provenance: {
      sourceName: "Imperial Survey Standard",
      referenceDocument: "Survey of India Land Records Manual",
      legalStatus: "Nationally recognized statutory land unit",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "hectare",
    name: "Hectare (ha)",
    nameHi: "हेक्टेयर",
    aliases: ["hectare", "ha", "hectares", "hector"],
    category: "standard",
    sqMeters: 10000,
    sqFt: 10000 * SQM_TO_SQFT, // ~107,639.104 sq ft
    regionCode: "ALL",
    note: "10,000 sq m ≈ 2.47105 Acres (Standard across modern 7/12 & Bhulekh portals)",
    noteHi: "10,000 वर्ग मीटर ≈ 2.471 एकड़ (आधुनिक भूलेख व सातबारा पोर्टल का आधिकारिक मानक)",
    provenance: {
      sourceName: "International System of Units (SI)",
      referenceDocument: "Department of Land Resources (DoLR), Govt of India",
      legalStatus: "Official statutory recording standard in all modern computerized land records",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "are",
    name: "Are (R)",
    nameHi: "आर",
    aliases: ["are", "r", "guntha are"],
    category: "standard",
    sqMeters: 100,
    sqFt: 100 * SQM_TO_SQFT, // ~1,076.391 sq ft
    regionCode: "ALL",
    note: "100 sq m = 0.01 Hectare (Represented as 'R' in Maharashtra Satbara 7/12 records)",
    noteHi: "100 वर्ग मीटर = 0.01 हेक्टेयर (महाराष्ट्र 7/12 रिकॉर्ड में 'आर' के रूप में दर्ज)",
    provenance: {
      sourceName: "Metric Land Measure",
      referenceDocument: "Maharashtra Land Revenue Code 1966",
      legalStatus: "Statutory subdivision of Hectare in revenue records",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "decimal_standard",
    name: "Decimal / Dismil / Cent",
    nameHi: "डेसिमल / डिसमिल / सेंट",
    aliases: ["decimal", "dismil", "desmil", "cent", "satak", "shatak"],
    category: "standard",
    sqMeters: 435.6 * SQFT_TO_SQM, // 40.468564224 m^2
    sqFt: 435.6,
    regionCode: "ALL",
    note: "1/100 Acre = 435.6 sq ft = 48.4 sq yd (Called Decimal in East, Cent in South)",
    noteHi: "1/100 एकड़ = 435.6 वर्ग फीट = 48.4 वर्ग गज (पूरब में डेसिमल, दक्षिण में सेंट)",
    provenance: {
      sourceName: "National Revenue Survey Standard",
      referenceDocument: "National Land Records Modernization Programme (NLRMP)",
      legalStatus: "Recognized statewide in West Bengal, Bihar, Odisha, Tamil Nadu, Kerala",
      confidence: "OFFICIAL_STANDARD",
    },
  },

  // ==========================================
  // 2. MAHARASHTRA & KARNATAKA & TELANGANA (Guntha Systems)
  // ==========================================
  {
    id: "guntha_mh",
    name: "Guntha (MH / KA / TG)",
    nameHi: "गुंठा (महाराष्ट्र / कर्नाटक / तेलंगाना)",
    aliases: ["guntha", "gunta", "guntho", "gunthas"],
    category: "regional",
    sqMeters: 1089 * SQFT_TO_SQM, // 101.17141056 m^2
    sqFt: 1089,
    regionCode: "MH",
    regionName: "Maharashtra",
    note: "33 ft × 33 ft = 121 sq yd = 1,089 sq ft (40 Guntha = 1 Acre)",
    noteHi: "33 फीट × 33 फीट = 121 वर्ग गज = 1,089 वर्ग फीट (40 गुंठा = 1 एकड़)",
    provenance: {
      sourceName: "Maharashtra Land Revenue Record Manual",
      referenceDocument: "Bombay Land Revenue Code 1879 / MLR Code 1966",
      legalStatus: "Universal customary survey unit across Western & Deccan India",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "bigha_mh",
    name: "Bigha (Maharashtra Customary)",
    nameHi: "बीघा (महाराष्ट्र पारंपरिक)",
    aliases: ["bigha mh", "maharashtra bigha"],
    category: "regional",
    sqMeters: 27225 * SQFT_TO_SQM,
    sqFt: 27225,
    regionCode: "MH",
    regionName: "Maharashtra",
    variantName: "25 Guntha Standard",
    variantNameHi: "25 गुंठा मानक",
    note: "25 Guntha = 27,225 sq ft = 0.625 Acre (Informal; 7/12 uses Hectare-Are)",
    noteHi: "25 गुंठा = 27,225 वर्ग फीट (पारंपरिक; आधिकारिक 7/12 रिकॉर्ड में हेक्टेयर-आर प्रयुक्त)",
    provenance: {
      sourceName: "Deccan & Khandesh Customary Revenue Registry",
      referenceDocument: "Gazetteer of Bombay Presidency",
      legalStatus: "Customary informal unit; not used in official Satbara computerized records",
      confidence: "WIDELY_USED_CUSTOMARY",
      qualification: "Official land registry in Maharashtra strictly records in Hectare-Are-Sq Meter.",
      qualificationHi: "महाराष्ट्र में आधिकारिक रजिस्ट्री केवल हेक्टेयर-आर-वर्ग मीटर में होती है।",
    },
  },

  // ==========================================
  // 3. UTTAR PRADESH & DELHI & PLAINS
  // ==========================================
  {
    id: "bigha_up_pucca",
    name: "Bigha (UP Pucca / Standard)",
    nameHi: "बीघा (उ.प्र. पक्का / मानक)",
    aliases: ["bigha up", "pucca bigha", "pakka bigha", "up bigha", "bigha pucca up"],
    category: "regional",
    sqMeters: 27225 * SQFT_TO_SQM, // 2,529.285264 m^2
    sqFt: 27225,
    regionCode: "UP",
    regionName: "Uttar Pradesh",
    variantName: "Pucca (Statutory Standard)",
    variantNameHi: "पक्का (वैधानिक मानक)",
    note: "55 yd × 55 yd = 3,025 sq yd = 27,225 sq ft (20 Biswa = 5/8 Acre)",
    noteHi: "55 गज × 55 गज = 3,025 वर्ग गज = 27,225 वर्ग फीट (20 बिस्वा = 0.625 एकड़)",
    provenance: {
      sourceName: "Uttar Pradesh Revenue Code, 2006",
      referenceDocument: "UP Board of Revenue Manual & Land Records Act",
      legalStatus: "Statutory standard conversion for consolidation and revenue in UP",
      confidence: "OFFICIAL_STANDARD",
      qualification: "Previous casual web portals rounded this to 27,000 sq ft; 27,225 sq ft is the statutory surveyed figure.",
      qualificationHi: "कुछ वेबसाइटें इसे 27,000 वर्ग फीट लिखती हैं; आधिकारिक वैधानिक मान 27,225 वर्ग फीट है।",
    },
  },
  {
    id: "biswa_up_pucca",
    name: "Biswa (UP Pucca)",
    nameHi: "बिस्वा (उ.प्र. पक्का)",
    aliases: ["biswa up", "pucca biswa", "biswa"],
    category: "regional",
    sqMeters: 1361.25 * SQFT_TO_SQM,
    sqFt: 1361.25,
    regionCode: "UP",
    regionName: "Uttar Pradesh",
    subdivision: { parentUnitId: "bigha_up_pucca", factor: 20, name: "Bigha", nameHi: "बीघा" },
    note: "1/20 Pucca Bigha = 151.25 sq yd = 1,361.25 sq ft",
    noteHi: "1/20 पक्का बीघा = 151.25 वर्ग गज = 1,361.25 वर्ग फीट",
    provenance: {
      sourceName: "UP Revenue Manual",
      referenceDocument: "Section 28, UP Zamindari Abolition Act",
      legalStatus: "Standard subdivision of Pucca Bigha",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "biswansi_up",
    name: "Biswansi (UP)",
    nameHi: "बिस्वांसी (उ.प्र.)",
    aliases: ["biswansi", "viswansi"],
    category: "regional",
    sqMeters: 68.0625 * SQFT_TO_SQM,
    sqFt: 68.0625,
    regionCode: "UP",
    regionName: "Uttar Pradesh",
    subdivision: { parentUnitId: "biswa_up_pucca", factor: 20, name: "Biswa", nameHi: "बिस्वा" },
    note: "1/20 Biswa = 1/400 Bigha = 68.0625 sq ft (Equal to 1 square Gunter's Gatha)",
    noteHi: "1/20 बिस्वा = 1/400 बीघा = 68.0625 वर्ग फीट (1 वर्ग गट्टा)",
    provenance: {
      sourceName: "UP Land Records Rules",
      referenceDocument: "UP Revenue Settlement Manual",
      legalStatus: "Statutory micro-unit in agricultural land records",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "bigha_up_kaccha",
    name: "Bigha (Western UP Kaccha)",
    nameHi: "बीघा (पश्चिमी उ.प्र. कच्चा)",
    aliases: ["kaccha bigha", "kacha bigha", "kutcha bigha", "meerut bigha"],
    category: "regional",
    sqMeters: 9075 * SQFT_TO_SQM,
    sqFt: 9075,
    regionCode: "UP",
    regionName: "Uttar Pradesh",
    variantName: "Kaccha (Western UP Customary)",
    variantNameHi: "कच्चा (पश्चिमी उ.प्र. पारंपरिक)",
    note: "1/3 of Pucca Bigha = 1,008.33 sq yd = 9,075 sq ft (Used informally in Meerut, Saharanpur, Muzaffarnagar)",
    noteHi: "पक्का बीघा का 1/3 = 1,008.33 वर्ग गज = 9,075 वर्ग फीट (मेरठ, मुजफ्फरनगर क्षेत्र)",
    provenance: {
      sourceName: "Western UP Customary Settlement Registry",
      referenceDocument: "Meerut Division Land Revenue Assessment",
      legalStatus: "Widely used customary local trade unit",
      confidence: "LOCAL_VARIANT",
    },
  },
  {
    id: "biswa_up_kaccha",
    name: "Biswa (Western UP Kaccha)",
    nameHi: "बिस्वा (पश्चिमी उ.प्र. कच्चा)",
    aliases: ["kaccha biswa", "biswa kaccha up"],
    category: "regional",
    sqMeters: 453.75 * SQFT_TO_SQM,
    sqFt: 453.75,
    regionCode: "UP",
    regionName: "Uttar Pradesh",
    subdivision: { parentUnitId: "bigha_up_kaccha", factor: 20, name: "Bigha (Kaccha)", nameHi: "बीघा (कच्चा)" },
    note: "1/20 Kaccha Bigha = 50.417 sq yd = 453.75 sq ft",
    noteHi: "1/20 कच्चा बीघा = 50.42 वर्ग गज = 453.75 वर्ग फीट",
    provenance: {
      sourceName: "Western UP Customary Settlement Manual",
      referenceDocument: "Meerut & Saharanpur District Gazetteers",
      legalStatus: "Customary subdivision of Western UP Kaccha Bigha",
      confidence: "LOCAL_VARIANT",
    },
  },

  // ==========================================
  // 4. BIHAR & JHARKHAND (Lagga Systems)
  // ==========================================
  {
    id: "bigha_bihar_standard",
    name: "Bigha (Bihar Standard / 5.5 Haath Lagga)",
    nameHi: "बीघा (बिहार मानक / 5.5 हाथ लग्गी)",
    aliases: ["bigha bihar", "bihar bigha", "patna bigha"],
    category: "regional",
    sqMeters: 27225 * SQFT_TO_SQM,
    sqFt: 27225,
    regionCode: "BR",
    regionName: "Bihar",
    variantName: "Standard 5.5-Haath Lagga (20 Kattha)",
    variantNameHi: "मानक 5.5 हाथ लग्गी (20 कट्ठा)",
    note: "20 Kattha = 400 Dhur = 27,225 sq ft (5.5 cubits pole = 8.25 ft; 1 Dhur = 68.0625 sq ft)",
    noteHi: "20 कट्ठा = 400 धुर = 27,225 वर्ग फीट (लग्गी 8.25 फीट; 1 धुर = 68.0625 वर्ग फीट)",
    provenance: {
      sourceName: "Bihar Survey and Settlement Manual",
      referenceDocument: "Bihar Tenancy Act 1885 / Bhu-Abhilekh Standards",
      legalStatus: "Official revenue benchmark across Central & South Bihar (Patna, Gaya, Nalanda)",
      confidence: "OFFICIAL_STANDARD",
      qualification: "Previous portal showed 27,220 sq ft due to rough truncation; 27,225 is the exact 5.5-haath square value.",
      qualificationHi: "सटीक गणितीय मान 27,225 वर्ग फीट (8.25 × 8.25 × 400) है।",
    },
  },
  {
    id: "kattha_bihar_standard",
    name: "Kattha (Bihar Standard)",
    nameHi: "कट्ठा (बिहार मानक)",
    aliases: ["kattha bihar", "katha bihar", "kattha", "katha"],
    category: "regional",
    sqMeters: 1361.25 * SQFT_TO_SQM,
    sqFt: 1361.25,
    regionCode: "BR",
    regionName: "Bihar",
    subdivision: { parentUnitId: "bigha_bihar_standard", factor: 20, name: "Bigha", nameHi: "बीघा" },
    note: "1/20 Bigha = 20 Dhur = 1,361.25 sq ft (Standard 5.5-haath lagga)",
    noteHi: "1/20 बीघा = 20 धुर = 1,361.25 वर्ग फीट (मानक 5.5 हाथ लग्गी)",
    provenance: {
      sourceName: "Bihar Land Revenue Standards",
      referenceDocument: "Directorate of Land Records & Survey, Bihar",
      legalStatus: "Standard customary unit in land transactions across Bihar & Jharkhand",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "dhur_bihar_standard",
    name: "Dhur (Bihar Standard)",
    nameHi: "धुर (बिहार मानक)",
    aliases: ["dhur bihar", "dhoor", "dhur"],
    category: "regional",
    sqMeters: 68.0625 * SQFT_TO_SQM,
    sqFt: 68.0625,
    regionCode: "BR",
    regionName: "Bihar",
    subdivision: { parentUnitId: "kattha_bihar_standard", factor: 20, name: "Kattha", nameHi: "कट्ठा" },
    note: "1/20 Kattha = 1 sq lagga (8.25 ft × 8.25 ft) = 68.0625 sq ft",
    noteHi: "1/20 कट्ठा = 1 वर्ग लग्गी (8.25 फीट × 8.25 फीट) = 68.0625 वर्ग फीट",
    provenance: {
      sourceName: "Bihar Survey Manual",
      referenceDocument: "Cadastral Survey Rules",
      legalStatus: "Primary base unit of lagga-based land measurement",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "bigha_bihar_6haath",
    name: "Bigha (North Bihar / 6.0 Haath Lagga)",
    nameHi: "बीघा (उत्तर बिहार / 6.0 हाथ लग्गी)",
    aliases: ["munger bigha", "tirhut bigha", "darbhanga bigha"],
    category: "regional",
    sqMeters: 32400 * SQFT_TO_SQM,
    sqFt: 32400,
    regionCode: "BR",
    regionName: "Bihar",
    variantName: "6.0-Haath Lagga (Tirhut / Mithila)",
    variantNameHi: "6.0 हाथ लग्गी (तिरहुत / मिथिला)",
    note: "20 Kattha = 32,400 sq ft (Lagga = 9 ft; 1 Dhur = 81 sq ft; 1 Kattha = 1,620 sq ft)",
    noteHi: "20 कट्ठा = 32,400 वर्ग फीट (लग्गी = 9 फीट; 1 धुर = 81 वर्ग फीट; 1 कट्ठा = 1,620 वर्ग फीट)",
    provenance: {
      sourceName: "Tirhut Settlement Operations Report",
      referenceDocument: "North Bihar Cadastral Survey Records",
      legalStatus: "Documented customary 6.0-haath variant; actual local applicability varies by pargana and must be verified against district revenue records",
      confidence: "LOCAL_VARIANT",
    },
  },
  {
    id: "kattha_bihar_6haath",
    name: "Kattha (Bihar / 6.0 Haath Lagga Customary)",
    nameHi: "कट्ठा (बिहार / 6.0 हाथ लग्गी पारंपरिक)",
    aliases: ["kattha 6haath", "tirhut kattha"],
    category: "regional",
    sqMeters: 1620 * SQFT_TO_SQM,
    sqFt: 1620,
    regionCode: "BR",
    regionName: "Bihar",
    variantName: "6.0-Haath Lagga (1,620 sq ft)",
    variantNameHi: "6.0 हाथ लग्गी (1,620 वर्ग फीट)",
    subdivision: { parentUnitId: "bigha_bihar_6haath", factor: 20, name: "Bigha", nameHi: "बीघा" },
    note: "1/20 Bigha = 20 Dhur = 180 sq yd = 1,620 sq ft (Lagga = 9 ft; local applicability varies by pargana/district)",
    noteHi: "1/20 बीघा = 20 धुर = 180 वर्ग गज = 1,620 वर्ग फीट (लग्गी = 9 फीट)",
    provenance: {
      sourceName: "Bihar District Settlement Survey Records",
      referenceDocument: "Customary Lagga Survey Schedules",
      legalStatus: "Documented customary 6.0-haath variant; actual local applicability must be verified against district revenue records",
      confidence: "LOCAL_VARIANT",
    },
  },
  {
    id: "dhur_bihar_6haath",
    name: "Dhur (Bihar / 6.0 Haath Lagga Customary)",
    nameHi: "धुर (बिहार / 6.0 हाथ लग्गी पारंपरिक)",
    aliases: ["dhur 6haath", "tirhut dhur"],
    category: "regional",
    sqMeters: 81 * SQFT_TO_SQM,
    sqFt: 81,
    regionCode: "BR",
    regionName: "Bihar",
    variantName: "6.0-Haath Lagga (81 sq ft)",
    variantNameHi: "6.0 हाथ लग्गी (81 वर्ग फीट)",
    subdivision: { parentUnitId: "kattha_bihar_6haath", factor: 20, name: "Kattha", nameHi: "कट्ठा" },
    note: "1/20 Kattha = 1 sq lagga (9 ft × 9 ft) = 81 sq ft = 9 sq yd (local applicability varies by pargana/district)",
    noteHi: "1/20 कट्ठा = 1 वर्ग लग्गी (9 फीट × 9 फीट) = 81 वर्ग फीट",
    provenance: {
      sourceName: "Bihar District Settlement Survey Records",
      referenceDocument: "Customary Lagga Survey Schedules",
      legalStatus: "Documented customary 6.0-haath variant; actual local applicability must be verified against district revenue records",
      confidence: "LOCAL_VARIANT",
    },
  },

  // ==========================================
  // 5. WEST BENGAL (Bengal System)
  // ==========================================
  {
    id: "bigha_wb",
    name: "Bigha (West Bengal)",
    nameHi: "बीघा (प. बंगाल)",
    aliases: ["bigha wb", "bengal bigha", "west bengal bigha"],
    category: "regional",
    sqMeters: 14400 * SQFT_TO_SQM, // 1,337.803776 m^2
    sqFt: 14400,
    regionCode: "WB",
    regionName: "West Bengal",
    note: "120 ft × 120 ft = 1,600 sq yd = 14,400 sq ft (20 Kattha; 40/121 Acre ≈ 0.33058 Acre, colloquially approximated as 1/3 Acre)",
    noteHi: "120 फीट × 120 फीट = 1,600 वर्ग गज = 14,400 वर्ग फीट (20 कट्ठा; लगभग 0.3306 एकड़)",
    provenance: {
      sourceName: "Bengal Regulation VII of 1822 / WB Land Reforms Act 1955",
      referenceDocument: "Banglarbhumi Manual, Directorate of Land Records and Surveys WB",
      legalStatus: "Statutory surveyed standard across West Bengal (80 cubits square)",
      confidence: "OFFICIAL_STANDARD",
      qualification: "Commonly approximated as 1/3 Acre, but 1/3 Acre is exactly 14,520 sq ft. The statutory surveyed Bengal standard is 14,400 sq ft (1,600 sq yd = 40/121 Acre).",
      qualificationHi: "बोलचाल में इसे 1/3 एकड़ कहा जाता है, परंतु वास्तविक 1/3 एकड़ 14,520 वर्ग फीट होता है। बंगाल में वैधानिक मान 14,400 वर्ग फीट (1,600 वर्ग गज) है।",
    },
  },
  {
    id: "kattha_wb",
    name: "Kattha (West Bengal / Cottah)",
    nameHi: "कट्ठा (प. बंगाल / कोट्टा)",
    aliases: ["kattha wb", "katha wb", "cottah", "cottha"],
    category: "regional",
    sqMeters: 720 * SQFT_TO_SQM, // 66.8901888 m^2
    sqFt: 720,
    regionCode: "WB",
    regionName: "West Bengal",
    subdivision: { parentUnitId: "bigha_wb", factor: 20, name: "Bigha", nameHi: "बीघा" },
    note: "1/20 Bigha = 80 sq yd = 720 sq ft (Standard Kolkata real estate unit)",
    noteHi: "1/20 बीघा = 80 वर्ग गज = 720 वर्ग फीट (कोलकाता रियल एस्टेट मानक)",
    provenance: {
      sourceName: "Kolkata Municipal Corporation & WB Land Records",
      referenceDocument: "KMC Building Rules & Registration Department",
      legalStatus: "Statutory unit for property registration in urban & rural WB",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "chatak_wb",
    name: "Chatak (West Bengal)",
    nameHi: "छटाक (प. बंगाल)",
    aliases: ["chatak", "chhatak", "satak wb"],
    category: "regional",
    sqMeters: 45 * SQFT_TO_SQM, // 4.1806368 m^2
    sqFt: 45,
    regionCode: "WB",
    regionName: "West Bengal",
    subdivision: { parentUnitId: "kattha_wb", factor: 16, name: "Kattha", nameHi: "कट्ठा" },
    note: "1/16 Kattha = 1/320 Bigha = 5 sq yd = 45 sq ft (CRITICAL FIX: verified 45 sq ft, not 180)",
    noteHi: "1/16 कट्ठा = 1/320 बीघा = 5 वर्ग गज = 45 वर्ग फीट (सत्यापित मानक मान)",
    provenance: {
      sourceName: "Bengal Survey Manual & Land Records Act",
      referenceDocument: "Banglarbhumi Official Glossary & Table of Measures",
      legalStatus: "Statutory micro-unit in West Bengal property deeds",
      confidence: "OFFICIAL_STANDARD",
      qualification: "Audit corrected a 400% error in previous prototypes where 1/4 Kattha (180 sq ft) was falsely labeled as 1 Chatak. 1 Kattha contains 16 Chataks, making 1 Chatak = 45 sq ft.",
      qualificationHi: "पूर्व प्रोटोटाइप में 180 वर्ग फीट दर्ज था जो गलत था। 1 कट्ठा = 16 छटाक = 720 वर्ग फीट, अतः 1 छटाक = 45 वर्ग फीट।",
    },
  },

  // ==========================================
  // 6. PUNJAB, HARYANA & NORTHERN CANAL SYSTEMS
  // ==========================================
  {
    id: "kanal",
    name: "Kanal (PB / HR / HP / JK)",
    nameHi: "कनाल (पंजाब / हरियाणा)",
    aliases: ["kanal", "kanaal", "kanals"],
    category: "regional",
    sqMeters: 5445 * SQFT_TO_SQM, // 505.857053 m^2
    sqFt: 5445,
    regionCode: "PB",
    regionName: "Punjab",
    note: "20 Marla = 605 sq yd = 5,445 sq ft (8 Kanal = 1 Acre / Killa; derived from 66-inch / 5.5 ft standard Karam)",
    noteHi: "20 मरला = 605 वर्ग गज = 5,445 वर्ग फीट (8 कनाल = 1 एकड़ / किल्ला; 66 इंच मानक करम आधारित)",
    provenance: {
      sourceName: "Punjab Land Records Manual (Part F, Section 4.40)",
      referenceDocument: "Punjab Land Records Society (PLRS) & Haryana Jamabandi",
      legalStatus: "Statutory standard unit under 66-inch Karam measurement system in Punjab, Haryana, HP, and J&K",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "marla",
    name: "Marla (PB / HR / HP / JK)",
    nameHi: "मरला (पंजाब / हरियाणा)",
    aliases: ["marla", "marle"],
    category: "regional",
    sqMeters: 272.25 * SQFT_TO_SQM, // 25.29285264 m^2
    sqFt: 272.25,
    regionCode: "PB",
    regionName: "Punjab",
    subdivision: { parentUnitId: "kanal", factor: 20, name: "Kanal", nameHi: "कनाल" },
    note: "1/20 Kanal = 9 Sarsahi = 30.25 sq yd = 272.25 sq ft (Based on standard 66-inch Karam; 1 Karam = 5.5 ft)",
    noteHi: "1/20 कनाल = 9 सरसाही = 30.25 वर्ग गज = 272.25 वर्ग फीट (66 इंच मानक करम आधारित)",
    provenance: {
      sourceName: "Punjab Land Records Manual (Part F, Section 4.40)",
      referenceDocument: "Directorate of Land Records Punjab",
      legalStatus: "Statutory standard unit in northwest India (66-inch Karam system; historical 57-inch Karam is not mixed)",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "killa",
    name: "Killa / Ghumaon (PB / HR)",
    nameHi: "किल्ला / घुमाओं (पंजाब / हरियाणा)",
    aliases: ["killa", "ghumaon", "quila"],
    category: "regional",
    sqMeters: 43560 * SQFT_TO_SQM,
    sqFt: 43560,
    regionCode: "PB",
    regionName: "Punjab",
    note: "8 Kanal = 160 Marla = 43,560 sq ft (= Exactly 1 Acre in standard 66-inch Karam consolidation)",
    noteHi: "8 कनाल = 160 मरला = 43,560 वर्ग फीट (= 66 इंच मानक करम में ठीक 1 एकड़)",
    provenance: {
      sourceName: "Punjab Land Records Manual & East Punjab Holdings Act 1948",
      referenceDocument: "PLRS Jamabandi Technical Glossary",
      legalStatus: "Official revenue term for rectangular consolidated surveyed acres in Punjab/Haryana",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "sarsahi",
    name: "Sarsahi (PB / HR)",
    nameHi: "सरसाही (पंजाब / हरियाणा)",
    aliases: ["sarsahi", "sarsai"],
    category: "regional",
    sqMeters: 30.25 * SQFT_TO_SQM,
    sqFt: 30.25,
    regionCode: "PB",
    regionName: "Punjab",
    subdivision: { parentUnitId: "marla", factor: 9, name: "Marla", nameHi: "मरला" },
    note: "1/9 Marla = 1 sq karam (5.5 ft × 5.5 ft = 30.25 sq ft; 1 Karam = 66 inches)",
    noteHi: "1/9 मरला = 1 वर्ग करम (5.5 फीट × 5.5 फीट = 30.25 वर्ग फीट; 1 करम = 66 इंच)",
    provenance: {
      sourceName: "Punjab Land Records Manual (Part F, Section 4.40)",
      referenceDocument: "PLRS Field Measurement Manual",
      legalStatus: "Micro-unit under 66-inch Karam schedule (1 sq Karam = 30.25 sq ft)",
      confidence: "OFFICIAL_STANDARD",
    },
  },

  // ==========================================
  // 7. RAJASTHAN
  // ==========================================
  {
    id: "bigha_rj_pucca",
    name: "Bigha Pucca (Rajasthan)",
    nameHi: "बीघा पक्का (राजस्थान)",
    aliases: ["bigha rj pucca", "pucca bigha rajasthan", "rajasthan bigha"],
    category: "regional",
    sqMeters: 27225 * SQFT_TO_SQM,
    sqFt: 27225,
    regionCode: "RJ",
    regionName: "Rajasthan",
    variantName: "Pucca (Statutory Standard)",
    variantNameHi: "पक्का (वैधानिक मानक)",
    note: "165 ft × 165 ft = 3,025 sq yd = 27,225 sq ft (20 Biswa = 5/8 Acre)",
    noteHi: "165 फीट × 165 फीट = 3,025 वर्ग गज = 27,225 वर्ग फीट (20 बिस्वा = 0.625 एकड़)",
    provenance: {
      sourceName: "Rajasthan Tenancy Act 1955",
      referenceDocument: "Board of Revenue for Rajasthan / Apna Khata",
      legalStatus: "Statutory agricultural benchmark in canal & settled areas",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "biswa_rj_pucca",
    name: "Biswa Pucca (Rajasthan)",
    nameHi: "बिस्वा पक्का (राजस्थान)",
    aliases: ["biswa rj", "biswa rajasthan"],
    category: "regional",
    sqMeters: 1361.25 * SQFT_TO_SQM,
    sqFt: 1361.25,
    regionCode: "RJ",
    regionName: "Rajasthan",
    subdivision: { parentUnitId: "bigha_rj_pucca", factor: 20, name: "Bigha Pucca", nameHi: "बीघा पक्का" },
    note: "1/20 Pucca Bigha = 1,361.25 sq ft = 151.25 sq yd",
    noteHi: "1/20 पक्का बीघा = 1,361.25 वर्ग फीट",
    provenance: {
      sourceName: "Rajasthan Land Revenue Rules",
      referenceDocument: "Revenue Board Manual",
      legalStatus: "Standard subdivision of Pucca Bigha",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "bigha_rj_kaccha",
    name: "Bigha Kaccha (Rajasthan Customary)",
    nameHi: "बीघा कच्चा (राजस्थान पारंपरिक)",
    aliases: ["kaccha bigha rj", "kaccha bigha rajasthan"],
    category: "regional",
    sqMeters: 17424 * SQFT_TO_SQM,
    sqFt: 17424,
    regionCode: "RJ",
    regionName: "Rajasthan",
    variantName: "Kaccha (Customary / Central Rajasthan)",
    variantNameHi: "कच्चा (पारंपरिक / शेखावाटी)",
    note: "132 ft × 132 ft = 1,936 sq yd = 17,424 sq ft = 0.4 Acre (Common in Shekhawati, Jaipur rural)",
    noteHi: "132 फीट × 132 फीट = 1,936 वर्ग गज = 17,424 वर्ग फीट (0.4 एकड़)",
    provenance: {
      sourceName: "Rajasthan Customary Land Settlement Reports",
      referenceDocument: "Settlement Department of Rajasthan",
      legalStatus: "Customary standard in traditional non-canal tracts",
      confidence: "WIDELY_USED_CUSTOMARY",
    },
  },

  // ==========================================
  // 8. MADHYA PRADESH
  // ==========================================
  {
    id: "bigha_mp_standard",
    name: "Bigha (MP Standard / Malwa)",
    nameHi: "बीघा (म.प्र. मानक / मालवा)",
    nameMr: "बीघा (म.प्र. मानक / माळवा)",
    aliases: ["bigha mp", "mp bigha", "malwa bigha"],
    category: "regional",
    sqMeters: 27225 * SQFT_TO_SQM,
    sqFt: 27225,
    regionCode: "MP",
    regionName: "Madhya Pradesh",
    variantName: "Standard 3,025 Sq Yard (Malwa / Mahakoshal)",
    variantNameHi: "मानक 3,025 वर्ग गज (मालवा / महाकौशल)",
    variantNameMr: "मानक 3,025 चौ. वार (माळवा / महाकौशल)",
    note: "20 Biswa = 3,025 sq yd = 27,225 sq ft = 0.625 Acre (Standard customary benchmark in Indore, Ujjain, Bhopal. Modern MP Bhulekh records use Metric Hectares).",
    noteHi: "20 बिस्वा = 3,025 वर्ग गज = 27,225 वर्ग फीट (इंदौर, उज्जैन, भोपाल क्षेत्र का प्रचलित पारंपरिक मानक। म.प्र. भूलेख रिकॉर्ड मीट्रिक हेक्टेयर में होते हैं)।",
    noteMr: "20 बिस्वा = 3,025 चौ. वार = 27,225 चौ. फूट (इंदूर, उज्जैन, भोपाळ भागातील पारंपरिक प्रमाण। म.प्र. भूलेख नोंदी मेट्रिक हेक्टरमध्ये असतात).",
    provenance: {
      sourceName: "Central India Customary Settlement Benchmark",
      referenceDocument: "Traditional 55 x 55 yard standard (3,025 sq yd); MP Bhulekh computerized land records use Metric Hectares",
      legalStatus: "Widely used customary agricultural benchmark across Western & Central MP (not defined as an explicit statutory unit in modern MP LRC 1959 sections)",
      confidence: "WIDELY_USED_CUSTOMARY",
      evidenceClassification: "LOCAL_REVENUE_CUSTOM",
      qualification: "Widely accepted in private deeds, agricultural rentals, and local patwari dealings across Malwa and Mahakoshal, but computerized MP Land Records are officially kept in Metric Hectares.",
      qualificationHi: "मालवा और महाकौशल में बैनामा व निजी व्यवहार में व्यापक प्रचलित, किंतु आधुनिक म.प्र. भूलेख रिकॉर्ड आधिकारिक रूप से मीट्रिक हेक्टेयर में दर्ज होते हैं।",
      qualificationMr: "माळवा आणि महाकौशल भागात खरेदी-विक्री व शेती व्यवहारात प्रचलित, पण संगणकीकृत म.प्र. भूलेख नोंदी अधिकृतपणे मेट्रिक हेक्टरमध्ये असतात.",
      lastVerifiedDate: "2026-11-06",
    },
  },
  {
    id: "bigha_mp_gwalior",
    name: "Bigha (MP Gwalior / Chambal Customary)",
    nameHi: "बीघा (म.प्र. ग्वालियर / चंबल पारंपरिक)",
    nameMr: "बीघा (म.प्र. ग्वाल्हेर / चंबळ पारंपरिक)",
    aliases: ["gwalior bigha", "chambal bigha"],
    category: "regional",
    sqMeters: 12000 * SQFT_TO_SQM,
    sqFt: 12000,
    regionCode: "MP",
    regionName: "Madhya Pradesh",
    variantName: "12,000 Sq Ft (Gwalior State Settlement)",
    variantNameHi: "12,000 वर्ग फीट (ग्वालियर रियासत बंदोबस्त)",
    variantNameMr: "12,000 चौ. फूट (ग्वाल्हेर संस्थान बंदोबस्त)",
    note: "20 Biswa = 12,000 sq ft = 1,333.33 sq yd (Historical Gwalior/Morena/Bhind customary standard, 1 Acre ≈ 3.63 Bigha).",
    noteHi: "20 बिस्वा = 12,000 वर्ग फीट (ग्वालियर, मुरैना, भिंड पारंपरिक रियासती माप, 1 एकड़ ≈ 3.63 बीघा)।",
    noteMr: "20 बिस्वा = 12,000 चौ. फूट (ग्वाल्हेर, मुरैना, भिंड पारंपरिक संस्थानाचा माप, 1 एकर ≈ 3.63 बीघा).",
    provenance: {
      sourceName: "Northern MP / Gwalior Princely State Customary Standard",
      referenceDocument: "Historical Gwalior Revenue Settlement customs (20 Biswa x 600 sq ft)",
      legalStatus: "Historical customary benchmark recognized in Gwalior and Chambal divisions; modern revenue records use Hectares",
      confidence: "WIDELY_USED_CUSTOMARY",
      evidenceClassification: "LOCAL_REVENUE_CUSTOM",
      qualification: "Historical customary variant preserved from the Gwalior State tenure settlement. Computerized revenue records across all MP districts are maintained in Metric Hectares.",
      qualificationHi: "ग्वालियर रियासत कालीन बंदोबस्त से चली आ रही पारंपरिक इकाई। आधुनिक सरकारी रिकॉर्ड हेक्टेयर में ही दर्ज होते हैं।",
      qualificationMr: "ग्वाल्हेर संस्थान काळातील बंदोबस्तातून चालत आलेली पारंपरिक पद्धत. आधुनिक महसूल नोंदी हेक्टरमध्येच होतात.",
      lastVerifiedDate: "2026-11-06",
    },
  },

  // ==========================================
  // 9. GUJARAT
  // ==========================================
  {
    id: "bigha_gj",
    name: "Bigha / Vigha (Gujarat / Saurashtra 16-Guntha)",
    nameHi: "बीघा / वीघा (गुजरात / सौराष्ट्र 16-गुंठा)",
    aliases: ["vigha", "bigha gj", "gujarat bigha", "gujarat vigha", "saurashtra vigha"],
    category: "regional",
    sqMeters: 17424 * SQFT_TO_SQM, // 1,618.742584 m^2
    sqFt: 17424,
    regionCode: "GJ",
    regionName: "Gujarat",
    variantName: "16-Guntha Standard (Saurashtra & Western Gujarat)",
    variantNameHi: "16-गुंठा मानक (सौराष्ट्र व पश्चिम गुजरात)",
    note: "16 Guntha = 1,936 sq yd = 17,424 sq ft = Exactly 0.4 Acre (2.5 Vighas = 1 Acre)",
    noteHi: "16 गुंठा = 1,936 वर्ग गज = 17,424 वर्ग फीट = ठीक 0.4 एकड़ (2.5 वीघा = 1 एकड़)",
    provenance: {
      sourceName: "Gujarat Land Revenue Rules",
      referenceDocument: "Revenue Department, Govt of Gujarat / AnyRoR Manual",
      legalStatus: "Standard customary unit in Gujarat agricultural land deals",
      confidence: "OFFICIAL_STANDARD",
      qualification: "16 Guntha × 1,089 sq ft = 17,424 sq ft (0.4 Acre). Standard across Saurashtra and general agricultural deed practice in Gujarat.",
      qualificationHi: "16 गुंठा × 1,089 वर्ग फीट = ठीक 17,424 वर्ग फीट।",
    },
  },
  {
    id: "bigha_gj_20guntha",
    name: "Vigha (Gujarat 20-Guntha / Central Gujarat)",
    nameHi: "वीघा (गुजरात 20-गुंठा / मध्य गुजरात)",
    aliases: ["vigha 20 guntha", "central gujarat vigha", "anand vigha", "kheda vigha"],
    category: "regional",
    sqMeters: 21780 * SQFT_TO_SQM, // 2,023.4282112 m^2
    sqFt: 21780,
    regionCode: "GJ",
    regionName: "Gujarat",
    variantName: "20-Guntha Customary (Central & North Gujarat)",
    variantNameHi: "20-गुंठा पारंपरिक (मध्य व उत्तर गुजरात)",
    note: "20 Guntha = 2,420 sq yd = 21,780 sq ft = Exactly 0.5 Acre (Common in Kheda, Anand, Vadodara rural)",
    noteHi: "20 गुंठा = 2,420 वर्ग गज = 21,780 वर्ग फीट = ठीक 0.5 एकड़",
    provenance: {
      sourceName: "Central Gujarat Customary Settlement Records",
      referenceDocument: "Bombay Land Revenue Code Historical Assessments in Gujarat",
      legalStatus: "Customary variant in central and north Gujarat agricultural tracts",
      confidence: "WIDELY_USED_CUSTOMARY",
    },
  },
  {
    id: "vaar_gj",
    name: "Vaar (Gujarat)",
    nameHi: "वार (गुजरात)",
    aliases: ["vaar", "var", "vaar gj"],
    category: "regional",
    sqMeters: 9 * SQFT_TO_SQM,
    sqFt: 9,
    regionCode: "GJ",
    regionName: "Gujarat",
    note: "1 Vaar = 1 Square Yard (Gaj) = 9 sq ft (Commonly used in Ahmedabad/Surat real estate)",
    noteHi: "1 वार = 1 वर्ग गज = 9 वर्ग फीट (गुजरात शहरी प्लॉट का मानक)",
    provenance: {
      sourceName: "Gujarat Urban Land Valuation Rules",
      referenceDocument: "Jantri Ready Reckoner, Gujarat Revenue Dept",
      legalStatus: "Official unit in urban Jantri valuation rates",
      confidence: "OFFICIAL_STANDARD",
    },
  },

  // ==========================================
  // 10. ASSAM
  // ==========================================
  {
    id: "bigha_assam",
    name: "Bigha (Assam)",
    nameHi: "बीघा (असम)",
    aliases: ["bigha assam", "assam bigha"],
    category: "regional",
    sqMeters: 14400 * SQFT_TO_SQM,
    sqFt: 14400,
    regionCode: "AS",
    regionName: "Assam",
    note: "5 Kattha = 100 Lecha = 14,400 sq ft (1,600 sq yd ≈ 0.3306 Acre; exact 1/3 Acre is 14,520 sq ft)",
    noteHi: "5 कट्ठा = 100 लेचा = 14,400 वर्ग फीट (1,600 वर्ग गज ≈ 0.3306 एकड़; वास्तविक 1/3 एकड़ 14,520 वर्ग फीट होता है)",
    provenance: {
      sourceName: "Assam Land Records Manual",
      referenceDocument: "Revenue & Disaster Management Dept, Govt of Assam / Dharitree",
      legalStatus: "Statutory land recording unit across the Brahmaputra Valley",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "kattha_assam",
    name: "Kattha (Assam)",
    nameHi: "कट्ठा (असम)",
    aliases: ["kattha assam", "katha assam"],
    category: "regional",
    sqMeters: 2880 * SQFT_TO_SQM,
    sqFt: 2880,
    regionCode: "AS",
    regionName: "Assam",
    subdivision: { parentUnitId: "bigha_assam", factor: 5, name: "Bigha", nameHi: "बीघा" },
    note: "1/5 Bigha = 20 Lecha = 320 sq yd = 2,880 sq ft",
    noteHi: "1/5 बीघा = 20 लेचा = 320 वर्ग गज = 2,880 वर्ग फीट",
    provenance: {
      sourceName: "Assam Land Records Manual",
      referenceDocument: "Dharitree Land Portal",
      legalStatus: "Statutory subdivision of Assam Bigha",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "lecha_assam",
    name: "Lecha (Assam)",
    nameHi: "लेचा (असम)",
    aliases: ["lecha", "lesa", "lessa"],
    category: "regional",
    sqMeters: 144 * SQFT_TO_SQM,
    sqFt: 144,
    regionCode: "AS",
    regionName: "Assam",
    subdivision: { parentUnitId: "kattha_assam", factor: 20, name: "Kattha", nameHi: "कट्ठा" },
    note: "1/20 Kattha = 1/100 Bigha = 16 sq yd = 144 sq ft",
    noteHi: "1/20 कट्ठा = 1/100 बीघा = 16 वर्ग गज = 144 वर्ग फीट",
    provenance: {
      sourceName: "Assam Land Records Rules",
      referenceDocument: "Dharitree Settlement System",
      legalStatus: "Smallest primary statutory land unit in Assam",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "chatak_assam",
    name: "Chatak (Assam / Barak Valley)",
    nameHi: "छटाक (असम / बराक घाटी)",
    aliases: ["chatak assam", "cachar chatak", "barak chatak"],
    category: "regional",
    sqMeters: 45 * SQFT_TO_SQM,
    sqFt: 45,
    regionCode: "AS",
    regionName: "Assam",
    variantName: "Barak Valley Customary (45 sq ft)",
    variantNameHi: "बराक घाटी पारंपरिक (45 वर्ग फीट)",
    note: "1/16 Kattha = 45 sq ft (In Barak Valley/Cachar; 4 Chataks = 180 sq ft = 0.25 Kattha)",
    noteHi: "1/16 कट्ठा = 45 वर्ग फीट (कछार/बराक घाटी; 4 छटाक = 180 वर्ग फीट = 0.25 कट्ठा)",
    provenance: {
      sourceName: "Cachar & Sylhet Tenancy Historical Settlement Rules",
      referenceDocument: "Assam Land Records Glossary / Barak Valley Revenue Standard",
      legalStatus: "Customary unit in Cachar, Hailakandi, and Karimganj districts",
      confidence: "WIDELY_USED_CUSTOMARY",
      qualification: "Casual internet tools often claim 1 Chatak = 180 sq ft in Assam. Primary records prove 180 sq ft is 1/4 Kattha (4 Chataks of 45 sq ft each). In Brahmaputra Valley, Katha is subdivided into 20 Lessas, not Chataks.",
      qualificationHi: "इंटरनेट पर 180 वर्ग फीट की भ्रांति है जो वास्तव में 1/4 कट्ठा (4 छटाक = 180 वर्ग फीट) है। 1 छटाक = 45 वर्ग फीट होता है।",
    },
  },

  // ==========================================
  // 11. HIMACHAL PRADESH & UTTARAKHAND (Hill Units)
  // ==========================================
  {
    id: "bigha_hp",
    name: "Bigha (Himachal Pradesh)",
    nameHi: "बीघा (हिमाचल प्रदेश)",
    aliases: ["bigha hp", "himachal bigha"],
    category: "regional",
    sqMeters: 8712 * SQFT_TO_SQM,
    sqFt: 8712,
    regionCode: "HP",
    regionName: "Himachal Pradesh",
    variantName: "Standard 8,712 sq ft (5 Bigha = 1 Acre)",
    variantNameHi: "मानक 8,712 वर्ग फीट (5 बीघा = 1 एकड़)",
    note: "20 Biswa = 968 sq yd = 8,712 sq ft (Exactly 0.2 Acre = 1/5 Acre)",
    noteHi: "20 बिस्वा = 968 वर्ग गज = 8,712 वर्ग फीट (0.2 एकड़)",
    provenance: {
      sourceName: "Himachal Pradesh Land Revenue Act 1954",
      referenceDocument: "HP Revenue Department / Himbhoomi",
      legalStatus: "Statutory land unit in Shimla, Mandi, Solan, Kullu, Bilaspur, Sirmaur districts",
      confidence: "OFFICIAL_STANDARD",
      qualification: "Standard HP Bigha is 8,712 sq ft (1/5 Acre = 20 Biswa of 435.6 sq ft). Some border areas with Punjab historically referenced the 9,075 sq ft Punjab Bigha.",
      qualificationHi: "मानक हिमाचल बीघा 8,712 वर्ग फीट (1/5 एकड़) है जिसमें 20 बिस्वा (435.6 वर्ग फीट प्रति बिस्वा) होते हैं।",
    },
  },
  {
    id: "biswa_hp",
    name: "Biswa (Himachal Pradesh)",
    nameHi: "बिस्वा (हिमाचल प्रदेश)",
    aliases: ["biswa hp", "himachal biswa"],
    category: "regional",
    sqMeters: 435.6 * SQFT_TO_SQM,
    sqFt: 435.6,
    regionCode: "HP",
    regionName: "Himachal Pradesh",
    subdivision: { parentUnitId: "bigha_hp", factor: 20, name: "Bigha", nameHi: "बीघा" },
    note: "1/20 HP Bigha = 48.4 sq yd = 435.6 sq ft (Equal to 1 Cent / 1 Decimal)",
    noteHi: "1/20 हिमाचल बीघा = 48.4 वर्ग गज = 435.6 वर्ग फीट (1 सेंट / 1 डेसिमल के बराबर)",
    provenance: {
      sourceName: "HP Land Revenue Manual",
      referenceDocument: "Himbhoomi Portal Land Glossary",
      legalStatus: "Statutory subdivision of HP Bigha (20 Biswa = 1 Bigha)",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "bigha_hp_punjabi",
    name: "Bigha (HP Lower Hills / Paonta Customary)",
    nameHi: "बीघा (हिमाचल तराई / पोंटा पारंपरिक)",
    aliases: ["bigha hp punjabi", "paonta bigha", "una bigha"],
    category: "regional",
    sqMeters: 9075 * SQFT_TO_SQM,
    sqFt: 9075,
    regionCode: "HP",
    regionName: "Himachal Pradesh",
    variantName: "Traditional 9,075 sq ft (Punjab Karam standard)",
    variantNameHi: "पारंपरिक 9,075 वर्ग फीट (पंजाब करम मानक)",
    note: "20 Biswa = 1,008.33 sq yd = 9,075 sq ft (Customary in Una, Paonta Sahib, Nalagarh tracts)",
    noteHi: "20 बिस्वा = 1,008.33 वर्ग गज = 9,075 वर्ग फीट (ऊना, पोंटा साहिब, नालागढ़ क्षेत्र)",
    provenance: {
      sourceName: "Punjab Land Administration Legacy in HP Merged Areas",
      referenceDocument: "HP Settlement Operations in Transferred Territories 1966",
      legalStatus: "Customary measurement in plains/lower hill tehsils adjoining Punjab/Haryana",
      confidence: "LOCAL_VARIANT",
    },
  },
  {
    id: "nali_uk",
    name: "Nali (Uttarakhand)",
    nameHi: "नाली (उत्तराखंड)",
    aliases: ["nali", "naali", "nali uk"],
    category: "regional",
    sqMeters: 2160 * SQFT_TO_SQM, // 200.6705664 m^2
    sqFt: 2160,
    regionCode: "UK",
    regionName: "Uttarakhand",
    note: "16 Mutthi = 240 sq yd = 2,160 sq ft (≈ 20.16 Nali = 1 Acre)",
    noteHi: "16 मुट्ठी = 240 वर्ग गज = 2,160 वर्ग फीट (पर्वतीय क्षेत्रों का मानक)",
    provenance: {
      sourceName: "Uttarakhand Land Revenue Board Rules",
      referenceDocument: "Bhulekh Uttarakhand / Kumaon-Garhwal Settlement Records",
      legalStatus: "Official customary unit for agricultural land in Kumaon & Garhwal hills",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "mutthi_uk",
    name: "Mutthi (Uttarakhand)",
    nameHi: "मुट्ठी (उत्तराखंड)",
    aliases: ["mutthi", "muthi"],
    category: "regional",
    sqMeters: 135 * SQFT_TO_SQM,
    sqFt: 135,
    regionCode: "UK",
    regionName: "Uttarakhand",
    subdivision: { parentUnitId: "nali_uk", factor: 16, name: "Nali", nameHi: "नाली" },
    note: "1/16 Nali = 15 sq yd = 135 sq ft",
    noteHi: "1/16 नाली = 15 वर्ग गज = 135 वर्ग फीट",
    provenance: {
      sourceName: "Kumaon Settlement Manual",
      referenceDocument: "Uttarakhand Revenue Department",
      legalStatus: "Traditional seed-sowing measure standardized to 135 sq ft",
      confidence: "OFFICIAL_STANDARD",
    },
  },

  // ==========================================
  // 12. SOUTH INDIA (Tamil Nadu, AP, Telangana, Kerala)
  // ==========================================
  {
    id: "ground_tn",
    name: "Ground (Tamil Nadu)",
    nameHi: "ग्राउंड (तमिलनाडु)",
    aliases: ["ground", "ground tn", "chennai ground"],
    category: "regional",
    sqMeters: 2400 * SQFT_TO_SQM, // 222.967296 m^2
    sqFt: 2400,
    regionCode: "TN",
    regionName: "Tamil Nadu",
    note: "2,400 sq ft = 266.67 sq yd = 5.51 Cents (Standard Chennai real estate plot unit)",
    noteHi: "2,400 वर्ग फीट = 266.67 वर्ग गज (चेन्नई शहरी प्लॉट का प्रमुख मात्रक)",
    provenance: {
      sourceName: "Tamil Nadu Land Survey and Records",
      referenceDocument: "Chennai Metropolitan Development Authority (CMDA) Rules",
      legalStatus: "Statutory land unit in Tamil Nadu Registration Department guideline values",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "ankanam_ap",
    name: "Ankanam (Andhra Pradesh / Telangana)",
    nameHi: "अंकनम (आंध्र प्रदेश / तेलंगाना)",
    aliases: ["ankanam", "ankanams"],
    category: "regional",
    sqMeters: 72 * SQFT_TO_SQM,
    sqFt: 72,
    regionCode: "AP",
    regionName: "Andhra Pradesh",
    note: "8 sq yd = 72 sq ft (Standard in Nellore, Tirupati, Rayalaseema; 1 Cent ≈ 6.05 Ankanams)",
    noteHi: "8 वर्ग गज = 72 वर्ग फीट (नेल्लोर, तिरुपति क्षेत्र का मानक)",
    provenance: {
      sourceName: "Andhra Pradesh Registration Department Guideline Manual",
      referenceDocument: "IGRS Andhra Pradesh Market Value Guidelines",
      legalStatus: "Official customary valuation unit in South Coastal Andhra",
      confidence: "WIDELY_USED_CUSTOMARY",
    },
  },
  {
    id: "kuncham_ap",
    name: "Kuncham (Andhra Pradesh)",
    nameHi: "कुंचम (आंध्र प्रदेश)",
    aliases: ["kuncham", "kunchams"],
    category: "regional",
    sqMeters: 4356 * SQFT_TO_SQM,
    sqFt: 4356,
    regionCode: "AP",
    regionName: "Andhra Pradesh",
    note: "10 Cents = 1/10 Acre = 4,356 sq ft (Customary in Coastal Andhra)",
    noteHi: "10 सेंट = 1/10 एकड़ = 4,356 वर्ग फीट (तटीय आंध्र पारंपरिक इकाई)",
    provenance: {
      sourceName: "Coastal Andhra Customary Land Registry",
      referenceDocument: "District Gazetteers of Andhra Pradesh",
      legalStatus: "Widely used customary agricultural measurement",
      confidence: "WIDELY_USED_CUSTOMARY",
    },
  },

  // ==========================================
  // 13. ODISHA
  // ==========================================
  {
    id: "guntha_od",
    name: "Guntha (Odisha Customary)",
    nameHi: "गुंठा (ओडिशा पारंपरिक)",
    aliases: ["guntha odisha", "orissa guntha"],
    category: "regional",
    sqMeters: 1742.4 * SQFT_TO_SQM,
    sqFt: 1742.4,
    regionCode: "OD",
    regionName: "Odisha",
    note: "16 Biswas = 1,742.4 sq ft (25 Odisha Guntha = 1 Acre; Distinct from Maharashtra Guntha)",
    noteHi: "16 बिस्वा = 1,742.4 वर्ग फीट (25 ओडिशा गुंठा = 1 एकड़; महाराष्ट्र गुंठा से भिन्न)",
    provenance: {
      sourceName: "Odisha Land Survey and Settlement Act",
      referenceDocument: "Bhulekh Odisha / Board of Revenue Odisha",
      legalStatus: "Customary land measure in coastal Odisha",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "biswa_od",
    name: "Biswa (Odisha)",
    nameHi: "बिस्वा (ओडिशा)",
    aliases: ["biswa odisha"],
    category: "regional",
    sqMeters: 108.9 * SQFT_TO_SQM,
    sqFt: 108.9,
    regionCode: "OD",
    regionName: "Odisha",
    subdivision: { parentUnitId: "guntha_od", factor: 16, name: "Guntha (Odisha)", nameHi: "गुंठा (ओडिशा)" },
    note: "1/16 Odisha Guntha = 108.9 sq ft",
    noteHi: "1/16 ओडिशा गुंठा = 108.9 वर्ग फीट",
    provenance: {
      sourceName: "Odisha Revenue Glossary",
      referenceDocument: "Bhulekh Odisha",
      legalStatus: "Subdivision of Odisha Guntha",
      confidence: "OFFICIAL_STANDARD",
    },
  },

  // ==========================================
  // 14. TRIPURA
  // ==========================================
  {
    id: "kani_tr",
    name: "Kani (Tripura)",
    nameHi: "कानी (त्रिपुरा)",
    aliases: ["kani", "kani tripura"],
    category: "regional",
    sqMeters: 17280 * SQFT_TO_SQM,
    sqFt: 17280,
    regionCode: "TR",
    regionName: "Tripura",
    note: "20 Ganda = 1,920 sq yd = 17,280 sq ft = 0.3967 Acre (2.5 Kani ≈ 1 Acre)",
    noteHi: "20 गंडा = 1,920 वर्ग गज = 17,280 वर्ग फीट = 0.3967 एकड़",
    provenance: {
      sourceName: "Tripura Land Revenue and Land Reforms Act 1960",
      referenceDocument: "Jhorobhoomi Tripura Land Records",
      legalStatus: "Statutory customary land unit in Tripura",
      confidence: "OFFICIAL_STANDARD",
    },
  },
  {
    id: "ganda_tr",
    name: "Ganda (Tripura)",
    nameHi: "गंडा (त्रिपुरा)",
    aliases: ["ganda", "ganda tripura"],
    category: "regional",
    sqMeters: 864 * SQFT_TO_SQM,
    sqFt: 864,
    regionCode: "TR",
    regionName: "Tripura",
    subdivision: { parentUnitId: "kani_tr", factor: 20, name: "Kani", nameHi: "कानी" },
    note: "1/20 Kani = 96 sq yd = 864 sq ft",
    noteHi: "1/20 कानी = 96 वर्ग गज = 864 वर्ग फीट",
    provenance: {
      sourceName: "Tripura Revenue Rules",
      referenceDocument: "Jhorobhoomi Manual",
      legalStatus: "Subdivision of Tripura Kani",
      confidence: "OFFICIAL_STANDARD",
    },
  },

  // ==========================================
  // 15. GOA
  // ==========================================
  {
    id: "alqueire_ga",
    name: "Alqueire (Goa Historical)",
    nameHi: "अल्केयर (गोवा ऐतिहासिक)",
    aliases: ["alqueire", "alqueire goa"],
    category: "regional",
    sqMeters: 1200, // Portuguese cadastral standard approx 1200 m^2
    sqFt: 1200 * SQM_TO_SQFT, // ~12,916.69 sq ft
    regionCode: "GA",
    regionName: "Goa",
    note: "≈ 1,200 sq m ≈ 12,917 sq ft (Historical Portuguese customary seed measure; modern deeds use metric Sq Meters)",
    noteHi: "≈ 1,200 वर्ग मीटर ≈ 12,917 वर्ग फीट (पुर्तगाली ऐतिहासिक माप; वर्तमान में वर्ग मीटर मान्य)",
    provenance: {
      sourceName: "Goa Cadastral Survey Historical Archives",
      referenceDocument: "Directorate of Settlement and Land Records (DSLR) Goa",
      legalStatus: "Historical customary measure; modern statutory records strictly use Square Meters",
      confidence: "HISTORICAL_CUSTOMARY",
    },
  },
];

export const UNIT_BY_ID = new Map<string, LandUnit>(
  ALL_UNITS.map((u) => [u.id, u]),
);

export function getUnit(id: string): LandUnit | undefined {
  if (!id) return undefined;
  const direct = UNIT_BY_ID.get(id);
  if (direct) return direct;

  if (typeof id === "string" && (id.startsWith("custom_") || id.startsWith("custom-"))) {
    const presets = loadCustomPresets();
    const cleanId = id.replace(/^custom_/, "");
    const preset = presets.find((p) => p.id === id || p.id === cleanId || `custom_${p.id}` === id);
    if (preset) {
      return customPresetToLandUnit(preset);
    }
  }

  // Resolve legacy concrete unit identifier
  const legacy = LEGACY_UNIT_MAP.get(id.toLowerCase().trim());
  if (legacy) {
    return UNIT_BY_ID.get(legacy.canonicalUnitId);
  }

  return undefined;
}

/**
 * Returns units available for a given region code.
 * Standard units are always included, plus user-defined custom units.
 * Includes declared shared traditional units from the region's metadata.
 */
export function getUnitsForRegion(regionCode: string): LandUnit[] {
  const code = regionCode.toUpperCase();
  const region = getRegion(code);

  // Units native to ALL or this specific region
  const base = ALL_UNITS.filter((u) => u.regionCode === "ALL" || u.regionCode === code);

  // Declared shared traditional units from region metadata
  const sharedUnits: LandUnit[] = [];
  if (region && Array.isArray(region.primaryTraditionalUnits)) {
    for (const unitId of region.primaryTraditionalUnits) {
      const unit = getUnit(unitId) || resolveUnit(unitId, { stateCode: code });
      if (unit && unit.regionCode !== "ALL" && unit.regionCode !== code) {
        sharedUnits.push(unit);
      }
    }
  }

  // Deduplicate by canonical unit ID
  const seenIds = new Set<string>();
  const combined: LandUnit[] = [];

  for (const u of [...base, ...sharedUnits]) {
    if (!seenIds.has(u.id)) {
      seenIds.add(u.id);
      combined.push(u);
    }
  }

  // User-defined custom units
  const custom = getCustomLandUnits();
  for (const c of custom) {
    if (!seenIds.has(c.id)) {
      seenIds.add(c.id);
      combined.push(c);
    }
  }

  return combined;
}

/**
 * Resolves a unit from an ID or legacy/generic identifier using an optional ConversionContext.
 * Handles migration of legacy URL parameters ('bigha', 'katha', 'biswa', 'chatak', 'guntha')
 * to exact regional unit definitions.
 */
export function resolveUnit(
  unitOrId: string | LandUnit,
  context?: ConversionContext,
): LandUnit | undefined {
  if (typeof unitOrId !== "string") return unitOrId;
  const direct = getUnit(unitOrId);
  if (direct) return direct;

  const normalized = unitOrId.toLowerCase().trim();
  const state = context?.stateCode?.toUpperCase();
  const variant = context?.variantId?.toLowerCase();

  // Check concrete legacy ID map
  const legacy = LEGACY_UNIT_MAP.get(normalized);
  if (legacy) {
    const canonical = UNIT_BY_ID.get(legacy.canonicalUnitId);
    if (canonical) return canonical;
  }

  // Legacy & generic unit mapping rules
  switch (normalized) {
    case "bigha": {
      if (state === "UP") {
        return variant === "kaccha" || variant === "kuchha"
          ? getUnit("bigha_up_kaccha")
          : getUnit("bigha_up_pucca");
      }
      if (state === "BR" || state === "JH") {
        return variant === "6haath" || variant === "tirhut" || variant === "north"
          ? getUnit("bigha_bihar_6haath")
          : getUnit("bigha_bihar_standard");
      }
      if (state === "WB") return getUnit("bigha_wb");
      if (state === "RJ") {
        return variant === "kaccha" || variant === "kuchha"
          ? getUnit("bigha_rj_kaccha")
          : getUnit("bigha_rj_pucca");
      }
      if (state === "MP" || state === "CG") {
        return variant === "gwalior"
          ? getUnit("bigha_mp_gwalior")
          : getUnit("bigha_mp_standard");
      }
      if (state === "GJ") {
        return variant === "20guntha"
          ? getUnit("bigha_gj_20guntha")
          : getUnit("bigha_gj");
      }
      if (state === "AS") return getUnit("bigha_assam");
      if (state === "HP" || state === "UK") {
        return variant === "punjabi"
          ? getUnit("bigha_hp_punjabi")
          : getUnit("bigha_hp");
      }
      if (state === "MH") return getUnit("bigha_mh");
      // Default fallback for bigha: UP/National Pucca Bigha (27,225 sq ft)
      return getUnit("bigha_up_pucca");
    }

    case "katha":
    case "kattha":
    case "cottah": {
      if (state === "BR" || state === "JH") {
        return variant === "6haath" || variant === "tirhut" || variant === "north"
          ? getUnit("kattha_bihar_6haath")
          : getUnit("kattha_bihar_standard");
      }
      if (state === "WB") return getUnit("kattha_wb");
      if (state === "AS") return getUnit("kattha_assam");
      if (state === "UP") return getUnit("biswa_up_pucca");
      return getUnit("kattha_bihar_standard");
    }

    case "dhur": {
      if (state === "BR" || state === "JH") {
        return variant === "6haath" || variant === "tirhut" || variant === "north"
          ? getUnit("dhur_bihar_6haath")
          : getUnit("dhur_bihar_standard");
      }
      return getUnit("dhur_bihar_standard");
    }

    case "biswa": {
      if (state === "UP") {
        return variant === "kaccha" || variant === "kuchha" ? getUnit("biswa_up_kaccha") : getUnit("biswa_up_pucca");
      }
      if (state === "HP") return getUnit("biswa_hp");
      if (state === "RJ") return getUnit("biswa_rj_pucca");
      if (state === "OD") return getUnit("biswa_od");
      return getUnit("biswa_up_pucca");
    }

    case "chatak":
    case "chhatak": {
      if (state === "AS") return getUnit("chatak_assam");
      return getUnit("chatak_wb");
    }

    case "guntha":
    case "gunta": {
      if (state === "OD") return getUnit("guntha_od");
      return getUnit("guntha_mh");
    }

    case "ground": {
      return getUnit("ground_tn");
    }

    case "cent":
    case "decimal":
    case "dismil": {
      return getUnit("decimal_standard");
    }

    case "gaj":
    case "gaz": {
      return getUnit("sqyd");
    }

    default:
      // Try alias match
      return ALL_UNITS.find((u) => u.aliases.includes(normalized));
  }
}


