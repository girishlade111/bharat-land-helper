// src/data/seoRoutes.ts
// Centralized, typed SEO metadata and route definitions for Bharat Land Converter
// Production Domain: https://land.ladestack.in/

import { SITE_URL, buildCanonicalUrl } from "../config/site.ts";

export interface RouteBreadcrumb {
  name: string;
  item: string;
}

export interface RouteFAQ {
  q: string;
  a: string;
}

export interface RelatedLink {
  title: string;
  path: string;
}

export interface ConversionRouteData {
  path: string;
  title: string;
  description: string;
  canonical: string;
  h1: string;
  fromUnit: string;
  toUnit: string;
  defaultVal: number;
  formula: string;
  inverseFormula: string;
  factor: number;
  stateName: string;
  stateCode: string;
  variantId?: string;
  statutoryRef: string;
  customaryNotes: string;
  conversionTable: [number, string][];
  faqs: RouteFAQ[];
  relatedLinks: RelatedLink[];
}

export interface CoreRouteData {
  path: string;
  title: string;
  description: string;
  canonical: string;
  h1: string;
  noindex?: boolean;
  breadcrumbs: RouteBreadcrumb[];
}

export const CORE_ROUTES: CoreRouteData[] = [
  {
    path: "/",
    title: "Bharat Land Converter | Bigha, Guntha, Acre, Hectare — All India",
    description: "Free Indian land area converter. Convert Bigha, Guntha, Acre, Hectare, Kanal, Marla, Cent for Maharashtra, UP, Bihar, Punjab, Tamil Nadu and all states. No login, works offline.",
    canonical: "https://land.ladestack.in/",
    h1: "Bharat Land Area Converter",
    breadcrumbs: [{ name: "Home", item: "https://land.ladestack.in/" }],
  },
  {
    path: "/about",
    title: "About Us | Bharat Land Converter",
    description: "Learn about Bharat Land Converter: our mission to provide accurate, transparent, and legally referenced land area conversions across all 36 Indian states and UTs.",
    canonical: "https://land.ladestack.in/about",
    h1: "About Bharat Land Converter",
    breadcrumbs: [
      { name: "Home", item: "https://land.ladestack.in/" },
      { name: "About Us", item: "https://land.ladestack.in/about" },
    ],
  },
  {
    path: "/faq",
    title: "Frequently Asked Questions | Bharat Land Converter",
    description: "Answers to common questions about Indian land measurement units, state-wise Bigha variations, Guntha, Kanal, Marla, and statutory land survey standards.",
    canonical: "https://land.ladestack.in/faq",
    h1: "Frequently Asked Questions",
    breadcrumbs: [
      { name: "Home", item: "https://land.ladestack.in/" },
      { name: "FAQ", item: "https://land.ladestack.in/faq" },
    ],
  },
  {
    path: "/contact",
    title: "Contact Us | Bharat Land Converter",
    description: "Get in touch with the Bharat Land Converter team for feedback, correction requests, regional unit inquiries, or developer partnerships.",
    canonical: "https://land.ladestack.in/contact",
    h1: "Contact Us",
    breadcrumbs: [
      { name: "Home", item: "https://land.ladestack.in/" },
      { name: "Contact Us", item: "https://land.ladestack.in/contact" },
    ],
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Bharat Land Converter",
    description: "Bharat Land Converter privacy policy: 100% offline-ready, no user registration, no server-side tracking of personal land calculations or valuations.",
    canonical: "https://land.ladestack.in/privacy",
    h1: "Privacy Policy",
    breadcrumbs: [
      { name: "Home", item: "https://land.ladestack.in/" },
      { name: "Privacy Policy", item: "https://land.ladestack.in/privacy" },
    ],
  },
  {
    path: "/terms",
    title: "Terms of Service | Bharat Land Converter",
    description: "Terms of service and legal disclaimer for Bharat Land Converter. Read our measurement accuracy notices, statutory guidelines, and usage terms.",
    canonical: "https://land.ladestack.in/terms",
    h1: "Terms of Service",
    breadcrumbs: [
      { name: "Home", item: "https://land.ladestack.in/" },
      { name: "Terms of Service", item: "https://land.ladestack.in/terms" },
    ],
  },
  {
    path: "/404",
    title: "Page Not Found | Bharat Land Converter",
    description: "The requested page could not be found. Use Bharat Land Converter to convert Bigha, Guntha, Acre, Hectare, Kanal, and other Indian land units.",
    canonical: "https://land.ladestack.in/404",
    h1: "404 - Page Not Found",
    noindex: true,
    breadcrumbs: [
      { name: "Home", item: "https://land.ladestack.in/" },
      { name: "Page Not Found", item: "https://land.ladestack.in/404" },
    ],
  },
];

export const CONVERSION_ROUTES: ConversionRouteData[] = [
  {
    path: "/convert/acre-to-sqft",
    title: "Convert Acre to Square Feet (sq ft) | Bharat Land Converter",
    description: "Convert Acre to Square Feet accurately. 1 Acre equals exactly 43,560 sq ft. Free instant calculator, exact formula, conversion table, and land measurement guide.",
    canonical: "https://land.ladestack.in/convert/acre-to-sqft",
    h1: "Convert Acre to Square Feet (sq ft)",
    fromUnit: "acre",
    toUnit: "sqft",
    defaultVal: 1,
    formula: "Area (sq ft) = Area (Acre) × 43,560",
    inverseFormula: "Area (Acre) = Area (sq ft) ÷ 43,560",
    factor: 43560,
    stateName: "National / Standard",
    stateCode: "MH",
    statutoryRef: "Indian Standards of Weights and Measures Act, 1976; National Cadastral Survey Standard.",
    customaryNotes: "Standard imperial acre across all Indian states and international real estate documentation. 1 Acre = 43,560 sq ft = 4,840 sq yd = 0.40468564224 Hectares.",
    conversionTable: [
      [1, "43,560"],
      [2, "87,120"],
      [5, "2,17,800"],
      [10, "4,35,600"],
      [25, "10,89,000"],
      [50, "21,78,000"],
      [100, "43,56,000"],
    ],
    faqs: [
      {
        q: "How many square feet are in 1 Acre?",
        a: "There are exactly 43,560 square feet in 1 Acre. This is the official measurement recognized by revenue authorities across all Indian states and Union Territories.",
      },
      {
        q: "How do you calculate Acre to sq ft?",
        a: "Multiply the number of acres by 43,560. For example, 2.5 Acres × 43,560 = 1,08,900 square feet.",
      },
      {
        q: "How many Guntha make 1 Acre in Maharashtra?",
        a: "In Maharashtra, exactly 40 Guntha make 1 Acre (40 × 1,089 sq ft = 43,560 sq ft).",
      },
    ],
    relatedLinks: [
      { title: "Hectare to Acre", path: "/convert/hectare-to-acre" },
      { title: "Acre to Guntha (Maharashtra)", path: "/convert/acre-to-guntha/maharashtra" },
      { title: "Acre to Bigha (Uttar Pradesh)", path: "/convert/acre-to-bigha/uttar-pradesh" },
    ],
  },
  {
    path: "/convert/hectare-to-acre",
    title: "Convert Hectare to Acre | Bharat Land Converter",
    description: "Convert Hectare to Acre accurately. 1 Hectare equals 2.47105 Acres. Free instant calculator, exact formula, conversion table, and agricultural land guide.",
    canonical: "https://land.ladestack.in/convert/hectare-to-acre",
    h1: "Convert Hectare to Acre",
    fromUnit: "hectare",
    toUnit: "acre",
    defaultVal: 1,
    formula: "Area (Acre) = Area (Hectare) × 2.4710538",
    inverseFormula: "Area (Hectare) = Area (Acre) ÷ 2.4710538",
    factor: 2.4710538146717,
    stateName: "National / Standard",
    stateCode: "MH",
    statutoryRef: "International System of Units (SI); Recognized by Survey of India and State Land Revenue Departments.",
    customaryNotes: "1 Hectare is defined as exactly 10,000 square meters (approx. 1,07,639.104 sq ft). It is the standard legal unit for government cadastral maps and agricultural land ceiling records in India.",
    conversionTable: [
      [1, "2.471"],
      [2, "4.942"],
      [5, "12.355"],
      [10, "24.711"],
      [20, "49.421"],
      [50, "123.553"],
      [100, "247.105"],
    ],
    faqs: [
      {
        q: "How many acres are in 1 Hectare?",
        a: "1 Hectare equals approximately 2.47105 Acres (or 2.47 Acres for quick estimations).",
      },
      {
        q: "Why is Hectare used in Indian land records?",
        a: "The Government of India adopted the metric system under the Standards of Weights and Measures Act. Official land titles (such as 7/12 in Maharashtra and Jamabandi in northern states) record agricultural land holdings in Hectares and Ares.",
      },
    ],
    relatedLinks: [
      { title: "Acre to Square Feet", path: "/convert/acre-to-sqft" },
      { title: "Acre to Guntha (Maharashtra)", path: "/convert/acre-to-guntha/maharashtra" },
      { title: "Acre to Bigha (Uttar Pradesh)", path: "/convert/acre-to-bigha/uttar-pradesh" },
    ],
  },
  {
    path: "/convert/acre-to-guntha/maharashtra",
    title: "Convert Acre to Guntha in Maharashtra | Bharat Land Converter",
    description: "Convert Acre to Guntha for Maharashtra land records. 1 Acre equals exactly 40 Guntha (1 Guntha = 1,089 sq ft). Free 7/12 Satbara converter, formula, and table.",
    canonical: "https://land.ladestack.in/convert/acre-to-guntha/maharashtra",
    h1: "Convert Acre to Guntha in Maharashtra",
    fromUnit: "acre",
    toUnit: "guntha_mh",
    defaultVal: 1,
    formula: "Area (Guntha) = Area (Acre) × 40",
    inverseFormula: "Area (Acre) = Area (Guntha) ÷ 40",
    factor: 40,
    stateName: "Maharashtra",
    stateCode: "MH",
    statutoryRef: "Maharashtra Land Revenue Code, 1966 (MLRC); Maharashtra Land Records Department (Bhulekh / 7/12 Extract).",
    customaryNotes: "In Maharashtra land records (Satbara Utara / 7/12), area is officially classified into Hectare-Are-Square Meters or Acres and Gunthas. Exactly 40 Gunthas constitute 1 Acre. 1 Guntha = 1,089 sq ft = 121 sq yd = 101.17 sq m (derived from 33 ft × 33 ft Gunter's chain half-square).",
    conversionTable: [
      [1, "40"],
      [2, "80"],
      [3, "120"],
      [5, "200"],
      [10, "400"],
      [25, "1,000"],
      [50, "2,000"],
    ],
    faqs: [
      {
        q: "How many Guntha make 1 Acre in Maharashtra?",
        a: "In Maharashtra, exactly 40 Guntha equal 1 Acre. 1 Guntha equals 1,089 square feet (33 ft × 33 ft).",
      },
      {
        q: "Is Guntha recognized in Maharashtra 7/12 records?",
        a: "Yes. While computerized 7/12 extracts show Hectare-Are format (1 Are = 100 sq m ≈ 0.9884 Guntha), customary registry and local property transactions across rural and urban Maharashtra continue to operate on Gunthas.",
      },
    ],
    relatedLinks: [
      { title: "Guntha to Sq Ft (Maharashtra)", path: "/convert/guntha-to-sqft/maharashtra" },
      { title: "Acre to Square Feet", path: "/convert/acre-to-sqft" },
      { title: "Hectare to Acre", path: "/convert/hectare-to-acre" },
    ],
  },
  {
    path: "/convert/guntha-to-sqft/maharashtra",
    title: "Convert Guntha to Square Feet in Maharashtra | Bharat Land Converter",
    description: "Convert Guntha to Sq Ft in Maharashtra. 1 Guntha equals exactly 1,089 sq ft (33 ft x 33 ft). Instant calculator, 7/12 formula, conversion table, and land valuation.",
    canonical: "https://land.ladestack.in/convert/guntha-to-sqft/maharashtra",
    h1: "Convert Guntha to Square Feet in Maharashtra",
    fromUnit: "guntha_mh",
    toUnit: "sqft",
    defaultVal: 1,
    formula: "Area (sq ft) = Area (Guntha) × 1,089",
    inverseFormula: "Area (Guntha) = Area (sq ft) ÷ 1,089",
    factor: 1089,
    stateName: "Maharashtra",
    stateCode: "MH",
    statutoryRef: "Maharashtra Land Revenue Code, 1966; Inspector General of Registration (IGR Maharashtra).",
    customaryNotes: "1 Guntha in Maharashtra is precisely 33 feet by 33 feet, which equals 1,089 square feet (or 121 square yards). This standard is uniform across Mumbai Suburban, Pune, Nashik, Nagpur, Chhatrapati Sambhajinagar, Kolhapur, and all other Maharashtra districts.",
    conversionTable: [
      [1, "1,089"],
      [2, "2,178"],
      [5, "5,445"],
      [10, "10,890"],
      [20, "21,780"],
      [40, "43,560 (1 Acre)"],
      [100, "1,08,900"],
    ],
    faqs: [
      {
        q: "How many sq ft in 1 Guntha in Maharashtra?",
        a: "In Maharashtra, 1 Guntha is exactly 1,089 square feet (33 feet × 33 feet).",
      },
      {
        q: "What is 1 Guntha plot size in feet?",
        a: "A square 1 Guntha plot measures 33 feet in length and 33 feet in width (33 ft × 33 ft = 1,089 sq ft).",
      },
    ],
    relatedLinks: [
      { title: "Acre to Guntha (Maharashtra)", path: "/convert/acre-to-guntha/maharashtra" },
      { title: "Acre to Square Feet", path: "/convert/acre-to-sqft" },
      { title: "Hectare to Acre", path: "/convert/hectare-to-acre" },
    ],
  },
  {
    path: "/convert/kanal-to-marla/punjab",
    title: "Convert Kanal to Marla in Punjab | Bharat Land Converter",
    description: "Convert Kanal to Marla in Punjab land records. 1 Kanal equals exactly 20 Marla (1 Marla = 272.25 sq ft). Jamabandi calculator, Karam-Sarsahi formula, and table.",
    canonical: "https://land.ladestack.in/convert/kanal-to-marla/punjab",
    h1: "Convert Kanal to Marla in Punjab",
    fromUnit: "kanal",
    toUnit: "marla",
    defaultVal: 1,
    formula: "Area (Marla) = Area (Kanal) × 20",
    inverseFormula: "Area (Kanal) = Area (Marla) ÷ 20",
    factor: 20,
    stateName: "Punjab",
    stateCode: "PB",
    statutoryRef: "Punjab Land Revenue Act, 1887; Directorate of Land Records, Punjab (PLRS Jamabandi).",
    customaryNotes: "In standard Punjab land measurement: 1 Karam = 66 inches (5.5 ft). 1 Sarsahi = 1 Karam × 1 Karam = 30.25 sq ft. 1 Marla = 9 Sarsahis = 272.25 sq ft. 1 Kanal = 20 Marlas = 5,445 sq ft. 8 Kanals = 1 Ghumaon / Acre = 43,560 sq ft. Note: Some urban development bodies or private colonies have historically used 225 sq ft or 216 sq ft Marla variants; the official revenue standard remains 272.25 sq ft per Marla.",
    conversionTable: [
      [1, "20"],
      [2, "40"],
      [4, "80"],
      [8, "160 (1 Acre)"],
      [10, "200"],
      [20, "400"],
      [50, "1,000"],
    ],
    faqs: [
      {
        q: "How many Marla in 1 Kanal in Punjab?",
        a: "In standard Punjab revenue measurement, 1 Kanal equals exactly 20 Marlas. 1 Marla is 272.25 square feet, and 1 Kanal is 5,445 square feet.",
      },
      {
        q: "How many Kanals are in 1 Acre / Killa in Punjab?",
        a: "Exactly 8 Kanals make 1 Acre (also called 1 Killa or Ghumaon) in Punjab (8 × 5,445 sq ft = 43,560 sq ft).",
      },
    ],
    relatedLinks: [
      { title: "Acre to Square Feet", path: "/convert/acre-to-sqft" },
      { title: "Hectare to Acre", path: "/convert/hectare-to-acre" },
      { title: "Acre to Bigha (Uttar Pradesh)", path: "/convert/acre-to-bigha/uttar-pradesh" },
    ],
  },
  {
    path: "/convert/ground-to-sqft/tamil-nadu",
    title: "Convert Ground to Square Feet in Tamil Nadu | Bharat Land Converter",
    description: "Convert Ground to Square Feet in Tamil Nadu. 1 Ground equals exactly 2,400 sq ft. Free Chennai real estate calculator, CMDA rules, conversion table, and guide.",
    canonical: "https://land.ladestack.in/convert/ground-to-sqft/tamil-nadu",
    h1: "Convert Ground to Square Feet in Tamil Nadu",
    fromUnit: "ground_tn",
    toUnit: "sqft",
    defaultVal: 1,
    formula: "Area (sq ft) = Area (Ground) × 2,400",
    inverseFormula: "Area (Ground) = Area (sq ft) ÷ 2,400",
    factor: 2400,
    stateName: "Tamil Nadu",
    stateCode: "TN",
    statutoryRef: "Tamil Nadu Department of Survey and Settlement; Chennai Metropolitan Development Authority (CMDA).",
    customaryNotes: "In Tamil Nadu urban real estate and cadastral records, 'Ground' is the standard benchmark unit for residential plots. 1 Ground = 2,400 square feet (approx 222.967 square meters = 5.5096 Cents). Exactly 18.15 Grounds make 1 Acre (18.15 × 2,400 = 43,560 sq ft).",
    conversionTable: [
      [0.5, "1,200"],
      [1, "2,400"],
      [2, "4,800"],
      [3, "7,200"],
      [5, "12,000"],
      [10, "24,000"],
      [18.15, "43,560 (1 Acre)"],
    ],
    faqs: [
      {
        q: "How many square feet are in 1 Ground in Tamil Nadu?",
        a: "1 Ground in Tamil Nadu equals exactly 2,400 square feet (approx. 222.967 square meters).",
      },
      {
        q: "How many Grounds are in 1 Acre?",
        a: "There are 18.15 Grounds in 1 Acre (43,560 ÷ 2,400 = 18.15).",
      },
      {
        q: "How many Cents in 1 Ground?",
        a: "1 Cent is 435.6 sq ft. Therefore, 1 Ground (2,400 sq ft) equals approximately 5.51 Cents.",
      },
    ],
    relatedLinks: [
      { title: "Acre to Square Feet", path: "/convert/acre-to-sqft" },
      { title: "Hectare to Acre", path: "/convert/hectare-to-acre" },
      { title: "Guntha to Sq Ft (Maharashtra)", path: "/convert/guntha-to-sqft/maharashtra" },
    ],
  },
  {
    path: "/convert/acre-to-bigha/uttar-pradesh",
    title: "Convert Acre to Bigha in Uttar Pradesh | Bharat Land Converter",
    description: "Convert Acre to Bigha in Uttar Pradesh (UP). 1 Acre equals 1.6 Pucca Bigha (1 Pucca Bigha = 27,225 sq ft). Pucca vs Kaccha Bigha calculator, Bhulekh formula, and table.",
    canonical: "https://land.ladestack.in/convert/acre-to-bigha/uttar-pradesh",
    h1: "Convert Acre to Bigha in Uttar Pradesh",
    fromUnit: "acre",
    toUnit: "bigha_up_pucca",
    defaultVal: 1,
    formula: "Area (Pucca Bigha) = Area (Acre) × 1.6",
    inverseFormula: "Area (Acre) = Area (Pucca Bigha) ÷ 1.6",
    factor: 1.6,
    stateName: "Uttar Pradesh",
    stateCode: "UP",
    statutoryRef: "Uttar Pradesh Revenue Code, 2006; UP Board of Revenue (Bhulekh UP).",
    customaryNotes: "In Uttar Pradesh revenue records, standard Bigha is 'Pucca Bigha' (or Pukka Bigha) defined as 55 yards × 55 yards = 3,025 sq yd = 27,225 sq ft (0.625 Acre). Thus, 1 Acre = 1.6 Pucca Bigha. In local eastern and rural pockets, 'Kaccha Bigha' is customarily used (often 1/3 of Pucca Bigha = 9,075 sq ft or ~8,400 sq ft depending on district). Bharat Land Converter provides instant switching between Pucca and Kaccha Bigha to avoid ambiguity.",
    conversionTable: [
      [1, "1.60 Pucca Bigha (4.80 Kaccha)"],
      [2, "3.20 Pucca Bigha (9.60 Kaccha)"],
      [5, "8.00 Pucca Bigha (24.0 Kaccha)"],
      [10, "16.00 Pucca Bigha (48.0 Kaccha)"],
      [25, "40.00 Pucca Bigha (120.0 Kaccha)"],
      [50, "80.00 Pucca Bigha (240.0 Kaccha)"],
    ],
    faqs: [
      {
        q: "How many Bigha in 1 Acre in Uttar Pradesh?",
        a: "In Uttar Pradesh, 1 Acre equals exactly 1.6 Pucca Bigha (or 4.8 Kaccha Bigha). 1 Pucca Bigha is 27,225 square feet.",
      },
      {
        q: "What is the difference between Pucca Bigha and Kaccha Bigha in UP?",
        a: "Pucca Bigha is the standard measurement used in official UP Bhulekh records (27,225 sq ft = 20 Biswa). Kaccha Bigha is an informal rural unit, commonly equal to one-third of a Pucca Bigha (9,075 sq ft or ~8,400 sq ft depending on the district).",
      },
      {
        q: "How many Biswa in 1 Bigha in UP?",
        a: "There are exactly 20 Biswa in 1 Pucca Bigha in Uttar Pradesh (1 Biswa = 1,361.25 sq ft).",
      },
    ],
    relatedLinks: [
      { title: "Acre to Square Feet", path: "/convert/acre-to-sqft" },
      { title: "Hectare to Acre", path: "/convert/hectare-to-acre" },
      { title: "Bigha to Kattha (West Bengal)", path: "/convert/bigha-to-kattha/west-bengal" },
    ],
  },
  {
    path: "/convert/bigha-to-kattha/west-bengal",
    title: "Convert Bigha to Kattha in West Bengal | Bharat Land Converter",
    description: "Convert Bigha to Kattha in West Bengal (Banglarbhumi). 1 Bigha equals exactly 20 Kattha (1 Bigha = 14,400 sq ft, 1 Kattha = 720 sq ft). Free calculator, formula, and table.",
    canonical: "https://land.ladestack.in/convert/bigha-to-kattha/west-bengal",
    h1: "Convert Bigha to Kattha in West Bengal",
    fromUnit: "bigha_wb",
    toUnit: "kattha_wb",
    defaultVal: 1,
    formula: "Area (Kattha) = Area (Bigha) × 20",
    inverseFormula: "Area (Bigha) = Area (Kattha) ÷ 20",
    factor: 20,
    stateName: "West Bengal",
    stateCode: "WB",
    statutoryRef: "West Bengal Land Reforms Act, 1955; Directorate of Land Records & Surveys, West Bengal (Banglarbhumi).",
    customaryNotes: "In West Bengal, the standard Bigha is standardized at exactly 14,400 square feet (1,600 sq yd = 120 ft × 120 ft), which is approximately one-third of an imperial acre (0.330578 Acre). 1 Bigha is subdivided into exactly 20 Katthas (Cottahs), with each Kattha equal to 720 square feet (80 sq yd). Each Kattha contains 16 Chataks (45 sq ft each).",
    conversionTable: [
      [0.25, "5"],
      [0.5, "10"],
      [1, "20"],
      [2, "40"],
      [5, "100"],
      [10, "200"],
      [20, "400"],
    ],
    faqs: [
      {
        q: "How many Kattha in 1 Bigha in West Bengal?",
        a: "In West Bengal, 1 Bigha equals exactly 20 Kattha (or Cottah). 1 Bigha is 14,400 square feet, and 1 Kattha is 720 square feet.",
      },
      {
        q: "How many square feet in 1 Kattha in Kolkata and West Bengal?",
        a: "1 Kattha in West Bengal is standardized at 720 square feet (80 square yards).",
      },
      {
        q: "How many Bighas in 1 Acre in West Bengal?",
        a: "1 Acre (43,560 sq ft) equals approximately 3.025 Bighas in West Bengal (43,560 ÷ 14,400 = 3.025).",
      },
    ],
    relatedLinks: [
      { title: "Acre to Square Feet", path: "/convert/acre-to-sqft" },
      { title: "Hectare to Acre", path: "/convert/hectare-to-acre" },
      { title: "Acre to Bigha (Uttar Pradesh)", path: "/convert/acre-to-bigha/uttar-pradesh" },
    ],
  },
];

export const ALL_PUBLIC_ROUTES = [
  ...CORE_ROUTES.map((r) => r.path),
  ...CONVERSION_ROUTES.map((r) => r.path),
];

export function getConversionRouteByPath(pathname: string): ConversionRouteData | undefined {
  const clean = pathname.replace(/\/$/, "");
  return CONVERSION_ROUTES.find((r) => r.path === clean || r.path === pathname);
}

export function getCoreRouteByPath(pathname: string): CoreRouteData | undefined {
  const clean = pathname.replace(/\/$/, "") || "/";
  return CORE_ROUTES.find((r) => r.path === clean);
}

