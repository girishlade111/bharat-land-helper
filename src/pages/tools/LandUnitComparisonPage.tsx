import React from "react";
import { Link } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegionalComparison from "@/components/RegionalComparison";
import { SITE_URL } from "@/config/site";
import { t } from "@/data/translations";
import {
  ChevronRight,
  BarChart3,
  BookOpen,
  Info,
  Scale,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface ToolPageProps {
  forcedLang?: "en" | "hi" | "mr";
}

function LandUnitComparisonContent() {
  const { lang } = useApp();
  const langPrefix = lang === "hi" ? "/hi" : lang === "mr" ? "/mr" : "";

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}${langPrefix}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: lang === "mr" ? "उपकरणे" : lang === "hi" ? "उपकरण" : "Tools",
        item: `${SITE_URL}${langPrefix}/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name:
          lang === "mr"
            ? "प्रादेशिक जमीन एकक तुलना"
            : lang === "hi"
            ? "क्षेत्रीय भूमि इकाई तुलना"
            : "Regional Land Unit Comparison",
        item: `${SITE_URL}${langPrefix}/tools/land-unit-comparison`,
      },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name:
      lang === "mr"
        ? "प्रादेशिक जमीन एकक तुलना मॅट्रिक्स - भारत लँड कन्व्हर्टर"
        : lang === "hi"
        ? "क्षेत्रीय भूमि इकाई तुलना मैट्रिक्स - भारत लैंड कनवर्टर"
        : "Regional Land Unit Comparison Matrix - Bharat Land Converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All modern web browsers",
    url: `${SITE_URL}${langPrefix}/tools/land-unit-comparison`,
    description:
      "Cross-state comparison matrix for Indian land measurement units including state-wise Bigha, Guntha, Biswa, Kattha, Kanal variations with legal provenance and square feet benchmarks.",
  };

  return (
    <main className="container max-w-4xl px-4 py-6 sm:py-8 space-y-7">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to={`${langPrefix}/`} className="hover:text-foreground transition-colors">
          {t("home", lang)}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`${langPrefix}/tools`} className="hover:text-foreground transition-colors">
          {lang === "mr" ? "उपकरणे" : lang === "hi" ? "उपकरण" : "Tools"}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-foreground">
          {lang === "mr"
            ? "प्रादेशिक एकक तुलना मॅट्रिक्स"
            : lang === "hi"
            ? "क्षेत्रीय इकाई तुलना मैट्रिक्स"
            : "Regional Unit Comparison"}
        </span>
      </nav>

      {/* Page Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {lang === "mr"
            ? "प्रादेशिक जमीन एकक तुलना मॅट्रिक्स (Regional Comparison)"
            : lang === "hi"
            ? "क्षेत्रीय भूमि इकाई तुलना मैट्रिक्स (Regional Comparison)"
            : "Regional Land Unit Comparison Matrix"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {lang === "mr"
            ? "भारतातील विविध राज्यांमध्ये बिघा, गुंठा, बिस्वा आणि कनाल यांच्या क्षेत्रफळ मूल्यांची तुलना करा. अधिकृत महसूल कायदे, पारंपारिक प्रथा आणि चौरस फूट प्रमाणांची तपासणी करा."
            : lang === "hi"
            ? "भारत के विभिन्न राज्यों में बीघा, गुंठा, बिस्वा और कनाल के क्षेत्रफल मूल्यों की तुलना करें। आधिकारिक राजस्व संदर्भ, पारंपरिक प्रथा और वर्ग फीट मानकों की पुष्टि करें।"
            : "Compare how traditional measurement units vary across Indian states. Filter by unit family (Bigha, Guntha, Biswa, Kattha, Kanal) to inspect square feet benchmarks, acre ratios, and statutory or customary evidence citations."}
        </p>
      </div>

      {/* Embedded Comparison Component */}
      <RegionalComparison />

      {/* Historical Origin of Variations */}
      <section aria-labelledby="history-origin-heading" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <h2 id="history-origin-heading" className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span>
            {lang === "mr"
              ? "राज्यांनुसार जमीन एककांमध्ये तफावत का आहे?"
              : lang === "hi"
              ? "राज्यों के अनुसार भूमि इकाइयों में भिन्नता क्यों है?"
              : "Why Do Indian Land Units Vary Across States?"}
          </span>
        </h2>

        <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
          <p>
            {lang === "mr"
              ? "आधुनिक मेट्रिक मानकांपेक्षा (१ हेक्टर = सर्वत्र १०,००० चौ. मी.) वेगळे, भारतातील पारंपारिक जमीन मोजमापे शेकडो वर्षांच्या प्रादेशिक महसूल बंदोबस्तातून विकसित झाली आहेत:"
              : lang === "hi"
              ? "आधुनिक मानकीकृत मीट्रिक मापों (१ हेक्टेयर = सर्वत्र १०,००० वर्ग मी.) के विपरीत, भारत की पारंपरिक राजस्व इकाइयाँ सैकड़ों वर्षों के ऐतिहासिक सर्वेक्षणों से विकसित हुई हैं:"
              : "Unlike modern standardized metric measures (1 Hectare = 10,000 sq m everywhere), traditional Indian land units evolved through regional revenue settlements over hundreds of years:"}
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
            <li>
              <strong>{lang === "mr" ? "मुघल इलाही गज व गंटर जरीब:" : lang === "hi" ? "मुगल इलाही गज एवं जरीब:" : "Mughal Ilahi Gaz & Gunter's Chain:"}</strong>{" "}
              {lang === "mr"
                ? "उत्तर भारतातील सुभ्यांमध्ये (उत्तर प्रदेश, बिहार) ५५ गज × ५५ गज (३,०२५ चौ. गज = २७,२२५ चौ. फूट) चौरसाला 'पक्का बीघा' म्हणून प्रमाणित केले गेले."
                : lang === "hi"
                ? "उत्तरी प्रांतों (उत्तर प्रदेश, बिहार) में ५५ गज × ५५ गज (३,०२५ वर्ग गज = २७,२२५ वर्ग फीट) के वर्ग को 'पक्का बीघा' के रूप में मानकीकृत किया गया।"
                : "In northern provinces (UP, Bihar, parts of Punjab), revenue officials standardized the Bigha to a square of 55 yards × 55 yards (3,025 square yards = 27,225 square feet), known as the Pucca Bigha."}
            </li>
            <li>
              <strong>{lang === "mr" ? "बंगाल कायमधारा बंदोबस्त (१७९३):" : lang === "hi" ? "बंगाल स्थायी बंदोबस्त (१७९३):" : "Bengal Permanent Settlement (1793):"}</strong>{" "}
              {lang === "mr"
                ? "बंगाल प्रेसिडेन्सीमध्ये (पश्चिम बंगाल, आसाम) बीघा १२० फूट × १२० फूट (१४,४०० चौ. फूट = १,६०० चौ. गज ≈ ०.३३०६ एकर; अचूक १/३ एकर नाही जो १४,५२० चौ. फूट असतो) म्हणून निश्चित केला गेला."
                : lang === "hi"
                ? "बंगाल प्रेसीडेंसी (पश्चिम बंगाल, असम) में बीघा १२० फीट × १२० फीट (१४,४०० वर्ग फीट = १,६०० वर्ग गज ≈ ०.३३०६ एकड़; सटीक १/३ एकड़ नहीं जो १४,५२० वर्ग फीट होता है) निर्धारित किया गया।"
                : "In Bengal Presidency (West Bengal, parts of Assam), the British East India Company standardized the Bigha to 120 ft × 120 ft (14,400 sq ft or 1,600 sq yd ≈ 0.3306 Acre; not exact 1/3 Acre which is 14,520 sq ft)."}
            </li>
            <li>
              <strong>{lang === "mr" ? "संस्थानकालीन स्थानिक भेद (मध्य प्रदेश व राजस्थान):" : lang === "hi" ? "रियासती स्थानीय भिन्नताएँ (मध्य प्रदेश एवं राजस्थान):" : "Princely State Customary Variations (Madhya Pradesh & Rajasthan):"}</strong>{" "}
              {lang === "mr"
                ? "संस्थानिक भागांमध्ये स्थानिक काठ्या (गठ्ठा / लठ्ठा) वेगवेगळ्या लांबीच्या होत्या (उदा. ग्वाल्हेरचा १२,००० चौ. फूट बीघा विरुद्ध माळव्याचा २७,२२५ चौ. फूट बीघा)."
                : lang === "hi"
                ? "रियासती क्षेत्रों में स्थानीय गट्ठा/लट्ठानुसार भिन्न मान रहे (जैसे ग्वालियर का १२,००० वर्ग फीट बीघा बनाम मालवा का २७,२२५ वर्ग फीट बीघा)।"
                : "Regions administered by princely states used local measuring rods (Gatha / Latha) of varying lengths (e.g., Gwalior's 12,000 sq ft Bigha vs Central India / Malwa's 27,225 sq ft Bigha)."}
            </li>
            <li>
              <strong>{lang === "mr" ? "पश्चिम भारत (महाराष्ट्र व गुजरात):" : lang === "hi" ? "पश्चिमी भारत (महाराष्ट्र एवं गुजरात):" : "Western India (Maharashtra & Gujarat):"}</strong>{" "}
              {lang === "mr"
                ? "बॉम्बे लँड रेव्हेन्यू कोडनुसार १ गुंठा बरोबर ३३ फूट × ३३ फूट = १,०८९ चौ. फूट (१२१ चौ. गज) निश्चित करण्यात आला, ज्यामध्ये बरोबर ४० गुंठे मिळून १ एकर होतो."
                : lang === "hi"
                ? "बॉम्बे लैंड रेवेन्यू कोड के अनुसार १ गुंठा ठीक ३३ फीट × ३३ फीट = १,०८९ वर्ग फीट (१२१ वर्ग गज) निर्धारित हुआ, जिससे ठीक ४० गुंठे मिलकर १ एकड़ बनाते हैं।"
                : "The Bombay Land Revenue Code standardized the Guntha at exactly 33 ft × 33 ft = 1,089 sq ft (121 sq yd), with exactly 40 Gunthas constituting one standard imperial acre."}
            </li>
          </ul>
        </div>
      </section>

      {/* Madhya Pradesh Provenance Notice */}
      <section className="space-y-2.5 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 text-xs text-foreground/80 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-sm">
          <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <h3>
            {lang === "mr"
              ? "मध्य प्रदेश बीघा: महसूल व प्रत्यक्ष संदर्भ"
              : lang === "hi"
              ? "मध्य प्रदेश बीघा: राजस्व एवं व्यावहारिक संदर्भ"
              : "Provenance Note on Madhya Pradesh Bigha"}
          </h3>
        </div>
        <p>
          {lang === "mr"
            ? "मध्य प्रदेशातील अधिकृत संगणकीकृत भूमी अभिलेख (MP Bhulekh) केवळ मेट्रिक हेक्टर आणि आरमध्ये नोंदवले जातात. मध्य प्रदेश जमीन महसूल संहिता, १९५९ सर्वेक्षण व महसूल प्रशासनाचे नियमन करते, परंतु त्यात वैधानिक बीघा गुणक निश्चित केलेला नाही."
            : lang === "hi"
            ? "मध्य प्रदेश के आधिकारिक कम्प्यूटरीकृत भू-अभिलेख (MP Bhulekh) केवल मीट्रिक हेक्टेयर और आर में दर्ज होते हैं। मध्य प्रदेश भू-राजस्व संहिता, १९५९ सर्वेक्षण प्रशासन को नियंत्रित करती है, परंतु इसमें कोई वैधानिक बीघा रूपांतरण दर परिभाषित नहीं है।"
            : "Official computerized land records in Madhya Pradesh (MP Bhulekh) record parcels strictly in Metric Hectares and Ares. The Madhya Pradesh Land Revenue Code, 1959 governs survey administration, tenure, and revenue recovery, but does not define a statutory Bigha conversion."}
        </p>
        <p>
          {lang === "mr"
            ? "येथे दिलेले मानके (२७,२२५ चौ. फूट मानक/माळवा बीघा आणि १२,००० चौ. फूट ग्वाल्हेर बीघा) स्थानिक पटवारी सराव, खरेदीखत आणि कृषी व्यवहारातील प्रचलित पारंपारिक घटक दर्शवतात."
            : lang === "hi"
            ? "यहाँ प्रस्तुत मानक (२७,२२५ वर्ग फीट मानक/मालवा बीघा और १२,००० वर्ग फीट ग्वालियर बीघा) स्थानीय पटवारी व्यवहार, बैनामा और कृषि व्यापार के व्यापक प्रचलित पारंपरिक गुणक हैं।"
            : "The benchmarks presented here (27,225 sq ft Standard/Malwa Bigha and 12,000 sq ft Gwalior Bigha) represent widely used customary revenue conversion factors preserved in local Patwari practice, registry deeds, and agricultural trade."}
        </p>
      </section>

      {/* Related links */}
      <section className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {lang === "mr" ? "संबंधित साधने व मार्गदर्शक" : lang === "hi" ? "संबंधित उपकरण एवं मार्गदर्शिकाएं" : "Related Tools & Guides"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <Link
            to={`${langPrefix}/tools/plot-area-calculator`}
            className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-foreground">
              {lang === "mr" ? "प्लॉट क्षेत्रफळ कॅल्क्युलेटर" : lang === "hi" ? "भूखंड क्षेत्रफल कैलकुलेटर" : "Plot Area Calculator"}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Link>
          <Link
            to={`${langPrefix}/tools/compound-land-unit-converter`}
            className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-foreground">
              {lang === "mr" ? "मिश्रित एकक कन्व्हर्टर" : lang === "hi" ? "मिश्रित इकाई परिवर्तक" : "Compound Unit Converter"}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Link>
          <Link
            to={`${langPrefix}/tools/custom-land-unit-calculator`}
            className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-foreground">
              {lang === "mr" ? "कस्टम स्थानिक एकक" : lang === "hi" ? "कस्टम स्थानीय इकाई" : "Custom Unit Manager"}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function LandUnitComparisonPage({ forcedLang }: ToolPageProps) {
  return (
    <AppProvider initialLang={forcedLang}>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <LandUnitComparisonContent />
        <Footer />
      </div>
    </AppProvider>
  );
}

