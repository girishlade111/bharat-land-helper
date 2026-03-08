export interface LandUnit {
  id: string;
  name: string;
  nameHi: string;
  sqft: number;
  category: string;
  note?: string;
  noteHi?: string;
}

export const UNITS: LandUnit[] = [
  // Standard
  { id: "sqft", name: "Square Feet", nameHi: "वर्ग फीट", sqft: 1, category: "Standard", note: "1 sq ft" },
  { id: "sqm", name: "Square Meter", nameHi: "वर्ग मीटर", sqft: 10.7639, category: "Standard", note: "≈ 10.76 sq ft" },
  { id: "sqyd", name: "Square Yard (Gaj)", nameHi: "वर्ग गज", sqft: 9, category: "Standard", note: "3ft × 3ft" },
  { id: "acre", name: "Acre", nameHi: "एकड़", sqft: 43560, category: "Standard", note: "43,560 sq ft" },
  { id: "hectare", name: "Hectare", nameHi: "हेक्टेयर", sqft: 107639.1, category: "Standard", note: "≈ 2.47 Acre" },

  // Maharashtra
  { id: "guntha_mh", name: "Guntha (MH)", nameHi: "गुंठा (महाराष्ट्र)", sqft: 1089, category: "Maharashtra", note: "33ft × 33ft", noteHi: "33 फीट × 33 फीट" },
  { id: "bigha_mh", name: "Bigha (MH)", nameHi: "बीघा (महाराष्ट्र)", sqft: 27225, category: "Maharashtra", note: "25 Guntha" },
  { id: "biswa_mh", name: "Biswa (MH)", nameHi: "बिस्वा (महाराष्ट्र)", sqft: 1361.25, category: "Maharashtra", note: "1/20 Bigha" },

  // Uttar Pradesh
  { id: "bigha_up", name: "Bigha (UP)", nameHi: "बीघा (उ.प्र.)", sqft: 27000, category: "UP", note: "20 Biswa" },
  { id: "biswa_up", name: "Biswa (UP)", nameHi: "बिस्वा (उ.प्र.)", sqft: 1350, category: "UP", note: "1/20 Bigha" },
  { id: "biswansi_up", name: "Biswansi (UP)", nameHi: "बिस्वांसी (उ.प्र.)", sqft: 67.5, category: "UP", note: "1/20 Biswa" },

  // Bihar / Jharkhand
  { id: "bigha_bihar", name: "Bigha (Bihar)", nameHi: "बीघा (बिहार)", sqft: 27220, category: "Bihar", note: "20 Kattha" },
  { id: "kattha_bihar", name: "Kattha (Bihar)", nameHi: "कट्ठा (बिहार)", sqft: 1361, category: "Bihar", note: "1/20 Bigha" },
  { id: "dhur_bihar", name: "Dhur (Bihar)", nameHi: "धुर (बिहार)", sqft: 68.06, category: "Bihar", note: "1/20 Kattha" },

  // West Bengal
  { id: "bigha_wb", name: "Bigha (WB)", nameHi: "बीघा (प.बंगाल)", sqft: 14400, category: "West Bengal", note: "20 Kattha" },
  { id: "kattha_wb", name: "Kattha (WB)", nameHi: "कट्ठा (प.बंगाल)", sqft: 720, category: "West Bengal", note: "1/20 Bigha" },
  { id: "chatak_wb", name: "Chatak (WB)", nameHi: "छटाक (प.बंगाल)", sqft: 180, category: "West Bengal", note: "1/4 Kattha" },
  { id: "decimal_wb", name: "Decimal (WB)", nameHi: "डेसिमल (प.बंगाल)", sqft: 435.6, category: "West Bengal", note: "1/100 Acre" },

  // Assam
  { id: "bigha_assam", name: "Bigha (Assam)", nameHi: "बीघा (असम)", sqft: 14400, category: "Assam", note: "5 Kattha" },
  { id: "kattha_assam", name: "Kattha (Assam)", nameHi: "कट्ठा (असम)", sqft: 2880, category: "Assam", note: "20 Lecha" },
  { id: "lecha_assam", name: "Lecha (Assam)", nameHi: "लेचा (असम)", sqft: 144, category: "Assam", note: "1/20 Kattha" },

  // Rajasthan
  { id: "bigha_pucca_rj", name: "Bigha Pucca (RJ)", nameHi: "बीघा पक्का (राजस्थान)", sqft: 27225, category: "Rajasthan", note: "20 Biswa" },
  { id: "bigha_kaccha_rj", name: "Bigha Kaccha (RJ)", nameHi: "बीघा कच्चा (राजस्थान)", sqft: 17424, category: "Rajasthan", note: "Smaller Bigha" },
  { id: "biswa_rj", name: "Biswa (RJ)", nameHi: "बिस्वा (राजस्थान)", sqft: 1361.25, category: "Rajasthan", note: "1/20 Bigha Pucca" },

  // Madhya Pradesh / Chhattisgarh
  { id: "bigha_mp", name: "Bigha (MP)", nameHi: "बीघा (म.प्र.)", sqft: 12000, category: "MP", note: "20 Biswa" },
  { id: "biswa_mp", name: "Biswa (MP)", nameHi: "बिस्वा (म.प्र.)", sqft: 600, category: "MP", note: "1/20 Bigha" },

  // Gujarat
  { id: "bigha_gj", name: "Bigha (GJ)", nameHi: "बीघा (गुजरात)", sqft: 17427, category: "Gujarat", note: "≈ 0.4 Acre" },
  { id: "vaar_gj", name: "Vaar (GJ)", nameHi: "वार (गुजरात)", sqft: 9, category: "Gujarat", note: "= 1 Sq Yard" },

  // Punjab / Haryana
  { id: "kanal", name: "Kanal", nameHi: "कनाल", sqft: 5445, category: "Punjab", note: "20 Marla" },
  { id: "marla", name: "Marla", nameHi: "मरला", sqft: 272.25, category: "Punjab", note: "1/20 Kanal" },
  { id: "killa", name: "Killa / Ghumaon", nameHi: "किल्ला / घुमाओं", sqft: 43560, category: "Punjab", note: "= 1 Acre" },

  // HP / Uttarakhand
  { id: "bigha_hp", name: "Bigha (HP)", nameHi: "बीघा (हि.प्र.)", sqft: 8712, category: "HP", note: "10 Biswa" },
  { id: "biswa_hp", name: "Biswa (HP)", nameHi: "बिस्वा (हि.प्र.)", sqft: 871.2, category: "HP", note: "1/10 Bigha" },
  { id: "nali_uk", name: "Nali (UK)", nameHi: "नाली (उत्तराखंड)", sqft: 2160, category: "HP", note: "Uttarakhand unit" },

  // South India
  { id: "cent", name: "Cent / Decimal", nameHi: "सेंट / डेसिमल", sqft: 435.6, category: "South", note: "1/100 Acre" },
  { id: "ground_tn", name: "Ground (TN)", nameHi: "ग्राउंड (तमिलनाडु)", sqft: 2400, category: "South", note: "Tamil Nadu unit" },
  { id: "ankanam", name: "Ankanam", nameHi: "अंकनम", sqft: 72, category: "South", note: "AP/Telangana" },
  { id: "guntha_ka", name: "Guntha (KA)", nameHi: "गुंठा (कर्नाटक)", sqft: 1089, category: "South", note: "33ft × 33ft" },
  { id: "kuncham_ap", name: "Kuncham (AP)", nameHi: "कुंचम (आं.प्र.)", sqft: 4356, category: "South", note: "1/10 Acre" },
];

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

export const STATE_TO_CATEGORY: Record<string, Category> = {
  "Maharashtra": "Maharashtra",
  "Uttar Pradesh": "UP",
  "Bihar": "Bihar",
  "Jharkhand": "Bihar",
  "West Bengal": "West Bengal",
  "Assam": "Assam",
  "Rajasthan": "Rajasthan",
  "Madhya Pradesh": "MP",
  "Chhattisgarh": "MP",
  "Gujarat": "Gujarat",
  "Punjab": "Punjab",
  "Haryana": "Punjab",
  "Himachal Pradesh": "HP",
  "Uttarakhand": "HP",
  "Tamil Nadu": "South",
  "Karnataka": "South",
  "Andhra Pradesh": "South",
  "Telangana": "South",
  "Kerala": "South",
};

export const STATES = Object.keys(STATE_TO_CATEGORY);

export function convert(value: number, fromUnitSqft: number, toUnitSqft: number): number {
  return (value * fromUnitSqft) / toUnitSqft;
}

export function formatIndianNumber(num: number): string {
  if (num < 0.01) return num.toFixed(6);
  if (num < 1) return num.toFixed(4);
  if (num < 100) return num.toFixed(2);
  const str = Math.round(num).toString();
  let lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== "") lastThree = "," + lastThree;
  return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
}

export function formatIndianCurrency(num: number): { formatted: string; words: string } {
  const formatted = "₹ " + formatIndianNumber(num);
  let words = "";
  if (num >= 1e7) words = `₹ ${(num / 1e7).toFixed(2)} Crore`;
  else if (num >= 1e5) words = `₹ ${(num / 1e5).toFixed(2)} Lakh`;
  else if (num >= 1e3) words = `₹ ${(num / 1e3).toFixed(2)} Thousand`;
  else words = `₹ ${num.toFixed(2)}`;
  return { formatted, words };
}

export const QUICK_REFS = [
  { section: "Maharashtra", sectionHi: "महाराष्ट्र", color: "border-primary", items: [
    "1 Guntha = 1,089 sq ft (33×33 ft)",
    "40 Guntha = 1 Acre",
    "1 Bigha (MH) = 25 Guntha = 27,225 sq ft",
  ]},
  { section: "UP / Bihar", sectionHi: "उ.प्र. / बिहार", color: "border-accent", items: [
    "1 Bigha (UP) = 27,000 sq ft = 20 Biswa",
    "1 Bigha (Bihar) = 27,220 sq ft = 20 Kattha",
    "1 Kattha (Bihar) = 1,361 sq ft",
    "1 Biswa (UP) = 1,350 sq ft",
  ]},
  { section: "Standard", sectionHi: "मानक", color: "border-ring", items: [
    "1 Acre = 43,560 sq ft",
    "1 Hectare = 1,07,639 sq ft = 2.47 Acre",
    "1 Square Meter = 10.7639 sq ft",
    "1 Square Yard (Gaj) = 9 sq ft",
  ]},
  { section: "Punjab / Haryana", sectionHi: "पंजाब / हरियाणा", color: "border-destructive", items: [
    "1 Kanal = 5,445 sq ft = 20 Marla",
    "1 Marla = 272.25 sq ft",
    "1 Killa = 1 Acre = 8 Kanal",
  ]},
  { section: "South India", sectionHi: "दक्षिण भारत", color: "border-muted-foreground", items: [
    "100 Cent = 1 Acre",
    "1 Ground (TN) = 2,400 sq ft",
    "1 Guntha (KA) = 1,089 sq ft",
    "1 Kuncham (AP) = 4,356 sq ft",
  ]},
];

export const BIGHA_COMPARISON = [
  { state: "Maharashtra", stateHi: "महाराष्ट्र", sqft: 27225, id: "bigha_mh" },
  { state: "UP", stateHi: "उ.प्र.", sqft: 27000, id: "bigha_up" },
  { state: "Bihar", stateHi: "बिहार", sqft: 27220, id: "bigha_bihar" },
  { state: "West Bengal", stateHi: "प.बंगाल", sqft: 14400, id: "bigha_wb" },
  { state: "Assam", stateHi: "असम", sqft: 14400, id: "bigha_assam" },
  { state: "Rajasthan (Pucca)", stateHi: "राजस्थान (पक्का)", sqft: 27225, id: "bigha_pucca_rj" },
  { state: "Rajasthan (Kaccha)", stateHi: "राजस्थान (कच्चा)", sqft: 17424, id: "bigha_kaccha_rj" },
  { state: "MP", stateHi: "म.प्र.", sqft: 12000, id: "bigha_mp" },
  { state: "Gujarat", stateHi: "गुजरात", sqft: 17427, id: "bigha_gj" },
  { state: "HP", stateHi: "हि.प्र.", sqft: 8712, id: "bigha_hp" },
];
