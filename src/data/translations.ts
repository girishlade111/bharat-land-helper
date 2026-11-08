// src/data/translations.ts
// Comprehensive Trilingual Translation Engine (English, Hindi, Marathi) for Bharat Land Converter

export type Lang = "en" | "hi" | "mr";

const T: Record<string, Record<Lang, string>> = {
  appTitle: {
    en: "Bharat Land Converter",
    hi: "भारत भूमि कन्वर्टर",
    mr: "भारत जमीन मोजणी व रूपांतरक",
  },
  tagline: {
    en: "Source-backed land measurement for all 28 States & 8 UTs",
    hi: "सभी 28 राज्यों और 8 केंद्र शासित प्रदेशों के लिए आधिकारिक भूमि माप",
    mr: "भारतातील सर्व २८ राज्ये व ८ केंद्रशासित प्रदेशांसाठी अधिकृत जमीन मोजणी",
  },
  selectState: {
    en: "Select State / UT",
    hi: "राज्य / केंद्र शासित प्रदेश चुनें",
    mr: "राज्य / केंद्रशासित प्रदेश निवडा",
  },
  enterValue: {
    en: "Enter area value",
    hi: "क्षेत्रफल दर्ज करें",
    mr: "क्षेत्रफळ टाका",
  },
  fromUnit: {
    en: "From Unit",
    hi: "प्रारंभिक इकाई",
    mr: "सुरुवातीचे एकक",
  },
  toUnit: {
    en: "To Unit",
    hi: "लक्ष्य इकाई",
    mr: "रूपांतरित एकक",
  },
  swapUnits: {
    en: "Swap Units",
    hi: "इकाइयाँ आपस में बदलें",
    mr: "एकके आपसात बदला",
  },
  conversionMode: {
    en: "Conversion Mode",
    hi: "रूपांतरण मोड",
    mr: "रूपांतरण पद्धत",
  },
  directConversion: {
    en: "Target Conversion",
    hi: "लक्षित रूपांतरण",
    mr: "थेट रूपांतरण",
  },
  allUnits: {
    en: "All Units Grid",
    hi: "सभी इकाइयाँ ग्रिड",
    mr: "सर्व एकके ग्रिड",
  },
  allStates: {
    en: "All 28 States & 8 UTs",
    hi: "सभी 28 राज्य और 8 केंद्र शासित प्रदेश",
    mr: "सर्व २८ राज्ये आणि ८ केंद्रशासित प्रदेश",
  },
  standard: {
    en: "Standard & Metric",
    hi: "मानक और मीट्रिक",
    mr: "प्रमाणित व मेट्रिक",
  },
  regional: {
    en: "Regional Units",
    hi: "क्षेत्रीय इकाइयाँ",
    mr: "प्रांतीय एकके",
  },
  copied: {
    en: "Copied to clipboard!",
    hi: "क्लिपबोर्ड पर कॉपी हुआ!",
    mr: "क्लिपबोर्डवर कॉपी झाले!",
  },
  share: {
    en: "Share Link",
    hi: "लिंक शेयर करें",
    mr: "लिंक शेअर करा",
  },
  shareWA: {
    en: "Share on WhatsApp",
    hi: "व्हाट्सएप पर शेयर करें",
    mr: "व्हॉट्सॲपवर शेअर करा",
  },
  rateCalc: {
    en: "Land Valuation Calculator",
    hi: "भूमि मूल्यांकन कैलकुलेटर",
    mr: "जमीन मूल्यांकन गणक",
  },
  ratePerUnit: {
    en: "Rate per unit (₹)",
    hi: "प्रति इकाई दर (₹)",
    mr: "प्रति एकक दर (₹)",
  },
  totalValue: {
    en: "Total Land Value",
    hi: "कुल भूमि मूल्य",
    mr: "एकूण जमीन मूल्य",
  },
  myLands: {
    en: "My Land Parcels",
    hi: "मेरी भूमि पार्सल",
    mr: "माझ्या जमिनी",
  },
  landName: {
    en: "Parcel name (e.g. Pune Farm)",
    hi: "पार्सल का नाम (उदा. पुणे फार्म)",
    mr: "जमिनीचे नाव (उदा. पुणे शेतजमीन)",
  },
  save: {
    en: "Save Parcel",
    hi: "पार्सल सहेजें",
    mr: "नोंद जतन करा",
  },
  saved: {
    en: "Parcel saved successfully!",
    hi: "पार्सल सफलतापूर्वक सहेजा गया!",
    mr: "जमीन नोंद यशस्वीरीत्या जतन केली!",
  },
  delete: {
    en: "Delete",
    hi: "हटाएं",
    mr: "हटवा",
  },
  totalArea: {
    en: "Total Saved Area",
    hi: "कुल सहेजा गया क्षेत्रफल",
    mr: "एकूण जतन केलेले क्षेत्रफळ",
  },
  export: {
    en: "Export for WhatsApp",
    hi: "व्हाट्सएप के लिए निर्यात",
    mr: "व्हॉट्सॲपसाठी निर्यात",
  },
  quickRef: {
    en: "Standard Reference Tables",
    hi: "मानक संदर्भ तालिकाएं",
    mr: "प्रमाणित संदर्भ तक्ते",
  },
  searchUnit: {
    en: "Search unit (e.g. guntha, bigha, kanal, cent, gaj)...",
    hi: "इकाई खोजें (उदा. गुंठा, बीघा, कनाल, सेंट, गज)...",
    mr: "एकक शोधा (उदा. गुंठा, एकर, बीघा, चौरस फूट, आर)...",
  },
  compareBigha: {
    en: "Compare Bigha Variations Across States",
    hi: "राज्यों में बीघा भिन्नता तुलना",
    mr: "विविध राज्यांतील बीघा प्रमाणांची तुलना",
  },
  areaVisual: {
    en: "Proportional Area Preview",
    hi: "आनुपातिक क्षेत्रफल दृश्य",
    mr: "प्रमाणबद्ध क्षेत्रफळ रेखाटन",
  },
  language: {
    en: "English",
    hi: "हिंदी",
    mr: "मराठी",
  },
  formula: {
    en: "Formula",
    hi: "सूत्र",
    mr: "सूत्र",
  },
  breakdown: {
    en: "Breakdown",
    hi: "विवरण",
    mr: "तपशील",
  },
  precision: {
    en: "Decimals",
    hi: "दशमलव",
    mr: "दशांश",
  },
  disclaimerTitle: {
    en: "Statutory Notice on Customary Units",
    hi: "पारंपरिक इकाइयों पर वैधानिक सूचना",
    mr: "पारंपरिक एककांविषयी वैधानिक सूचना",
  },
  disclaimerText: {
    en: "Traditional land units (Bigha, Kattha, Biswa, etc.) vary by district and local survey customs. In Maharashtra, statutory 7/12 land records are recorded in Hectares, Ares, and Gunthas (1 Guntha = 1,089 sq ft, 40 Guntha = 1 Acre). For official registry, mutation, or title execution, always verify with your local Talathi / Tehsildar / Land Records office.",
    hi: "पारंपरिक भूमि इकाइयाँ (बीघा, कट्ठा, बिस्वा आदि) तहसील और स्थानीय बंदोबस्त के अनुसार भिन्न हो सकती हैं। महाराष्ट्र में ७/१२ रिकॉर्ड हेक्टेयर, आर और गुंठा (१ गुंठा = १,०८९ वर्ग फीट, ४० गुंठा = १ एकड़) में दर्ज होते हैं। आधिकारिक बैनामा, दाखिल-खारिज या कानूनी कार्यों हेतु स्थानीय पटवारी/तलाठी कार्यालय से पुष्टि करें।",
    mr: "पारंपरिक जमीन एकके (बीघा, काठा, बिस्वा इ.) स्थानिक महसूल पद्धतींनुसार बदलू शकतात. महाराष्ट्रात ७/१२ उताऱ्यावरील अधिकृत जमिनीच्या नोंदी हेक्टर, आर आणि गुंठ्यामध्ये असतात (१ गुंठा = १,०८९ चौ. फूट, ४० गुंठा = १ एकर, १०० गुंठा = १ हेक्टर). खरेदीखत, दस्तनोंदणी किंवा फेरफार नोंदीसाठी नेहमी स्थानिक तलाठी किंवा भूमी अभिलेख कार्यालयाकडून खात्री करून घ्यावी.",
  },
  confidenceOfficial: {
    en: "Official Revenue Standard",
    hi: "आधिकारिक राजस्व मानक",
    mr: "अधिकृत महसूल प्रमाण",
  },
  confidenceCustomary: {
    en: "Widely Used Customary",
    hi: "प्रचलित पारंपरिक",
    mr: "प्रचलित पारंपरिक प्रमाण",
  },
  confidenceLocal: {
    en: "Local / District Variant",
    hi: "जिला / स्थानीय प्रकार",
    mr: "स्थानिक / जिल्हा प्रकार",
  },
  footerTagline: {
    en: "Accurate, source-backed land measurement for every Indian citizen",
    hi: "हर भारतीय नागरिक के लिए सटीक, स्रोत-सत्यापित भूमि माप",
    mr: "प्रत्येक भारतीय नागरिकासाठी अचूक आणि अधिकृत जमीन मोजणी",
  },
  footerFree: {
    en: "100% Free · Client-Side Privacy · No Login",
    hi: "100% मुफ़्त · पूर्ण गोपनीयता · बिना लॉगिन",
    mr: "१००% मोफत · संपूर्ण गोपनीयता · लॉगिनची गरज नाही",
  },

  // Tool Navigation and Tab Titles
  tabConverter: {
    en: "Direct Converter",
    hi: "सीधा कनवर्टर",
    mr: "थेट रूपांतरक",
  },
  tabPlot: {
    en: "Plot Dimensions",
    hi: "प्लॉट विमा",
    mr: "प्लॉट आकारमान",
  },
  tabCompound: {
    en: "Compound Units",
    hi: "मिश्र इकाइयाँ",
    mr: "मिश्र एकके",
  },
  tabCompare: {
    en: "Unit Comparison",
    hi: "इकाई तुलना",
    mr: "एकक तुलना",
  },
  tabCustom: {
    en: "Custom Factors",
    hi: "कस्टम कारक",
    mr: "सानुकूल घटक",
  },
  tabHistory: {
    en: "History & Saved",
    hi: "इतिहास एवं सहेजे गए",
    mr: "इतिहास व नोंदी",
  },

  // Plot Calculator Specific
  plotLength: {
    en: "Plot Length",
    hi: "प्लॉट की लंबाई",
    mr: "प्लॉटची लांबी",
  },
  plotWidth: {
    en: "Plot Width",
    hi: "प्लॉट की चौड़ाई",
    mr: "प्लॉटची रुंदी",
  },
  plotPerimeter: {
    en: "Perimeter",
    hi: "परिमाप",
    mr: "परिमिती (एकूण कुंपण लांबी)",
  },
  plotCalculatedArea: {
    en: "Calculated Plot Area",
    hi: "गणना किया गया प्लॉट क्षेत्रफल",
    mr: "एकूण मोजलेले क्षेत्रफळ",
  },
  plotTransferAction: {
    en: "Transfer to Converter",
    hi: "कनवर्टर में लोड करें",
    mr: "रूपांतरकामध्ये पाठवा",
  },

  // Nav Links
  navHome: { en: "Home", hi: "होम", mr: "मुख्यपृष्ठ" },
  navTools: { en: "Tools Hub", hi: "टूल्स हब", mr: "टूल्स हब" },
  navAbout: { en: "About", hi: "हमारे बारे में", mr: "आमच्याबद्दल" },
  navFaq: { en: "FAQ", hi: "सामान्य प्रश्न", mr: "वारंवार विचारले जाणारे प्रश्न" },
  navContact: { en: "Contact", hi: "संपर्क", mr: "संपर्क" },
  navPrivacy: { en: "Privacy", hi: "गोपनीयता", mr: "गोपनीयता धोरण" },
  navTerms: { en: "Terms", hi: "नियम", mr: "नियम व अटी" },
};

export function t(key: string, lang: Lang = "en"): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key;
}
