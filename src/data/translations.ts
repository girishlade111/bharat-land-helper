export type Lang = "en" | "hi";

const T: Record<string, Record<Lang, string>> = {
  appTitle: { en: "Bharat Land Converter", hi: "भारत भूमि कन्वर्टर" },
  selectState: { en: "Select State", hi: "राज्य चुनें" },
  enterValue: { en: "Enter area value", hi: "क्षेत्रफल दर्ज करें" },
  fromUnit: { en: "From Unit", hi: "इकाई चुनें" },
  allUnits: { en: "All Units", hi: "सभी इकाइयाँ" },
  standard: { en: "Standard", hi: "मानक" },
  copied: { en: "Copied!", hi: "कॉपी हुआ!" },
  share: { en: "Share Link", hi: "लिंक शेयर करें" },
  shareWA: { en: "WhatsApp Share", hi: "व्हाट्सएप शेयर" },
  rateCalc: { en: "💰 Land Rate Calculator", hi: "💰 भूमि दर कैलकुलेटर" },
  ratePerUnit: { en: "Rate per unit (₹)", hi: "प्रति इकाई दर (₹)" },
  totalValue: { en: "Total Land Value", hi: "कुल भूमि मूल्य" },
  myLands: { en: "📋 My Land List", hi: "📋 मेरी भूमि सूची" },
  landName: { en: "Give this land a name", hi: "इस भूमि को नाम दें" },
  save: { en: "Save", hi: "सहेजें" },
  delete: { en: "Delete", hi: "हटाएं" },
  totalArea: { en: "Your Total Land", hi: "आपकी कुल भूमि" },
  export: { en: "Export for WhatsApp", hi: "व्हाट्सएप के लिए निर्यात" },
  quickRef: { en: "📊 Quick Reference", hi: "📊 त्वरित संदर्भ" },
  searchUnit: { en: "Search unit name...", hi: "इकाई का नाम खोजें..." },
  compareBigha: { en: "📏 Compare Bigha Across States", hi: "📏 राज्यों में बीघा तुलना" },
  areaVisual: { en: "Area Visualization", hi: "क्षेत्र दृश्य" },
  proTitle: { en: "🔒 Upgrade to Pro", hi: "🔒 प्रो में अपग्रेड करें" },
  proDesc: { en: "Save unlimited parcels + AI Land Valuation", hi: "असीमित पार्सल सहेजें + AI भूमि मूल्यांकन" },
  language: { en: "हिंदी", hi: "English" },
  noValue: { en: "--", hi: "--" },
  footerTagline: { en: "For every farmer and broker in India", hi: "भारत के हर किसान और दलाल के लिए" },
  footerFree: { en: "Free · No login · No ads", hi: "मुफ़्त · बिना लॉगिन · बिना विज्ञापन" },
};

export function t(key: string, lang: Lang): string {
  return T[key]?.[lang] ?? key;
}
