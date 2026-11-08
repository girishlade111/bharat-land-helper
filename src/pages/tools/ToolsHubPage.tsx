import React from "react";
import { Link } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/config/site";
import { t } from "@/data/translations";
import {
  Ruler,
  Layers,
  BarChart3,
  Sliders,
  ArrowRight,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Compass,
  FileText,
  Calculator,
} from "lucide-react";

interface ToolsHubPageProps {
  forcedLang?: "en" | "hi" | "mr";
}

function ToolsHubContent() {
  const { lang } = useApp();

  const langPrefix = lang === "hi" ? "/hi" : lang === "mr" ? "/mr" : "";

  const tools = [
    {
      id: "plot-area",
      title:
        lang === "mr"
          ? "प्लॉट क्षेत्रफळ कॅल्क्युलेटर (Plot Dimensions)"
          : lang === "hi"
          ? "भूखंड विमा क्षेत्रफल कैलकुलेटर (Plot Dimensions)"
          : "Plot Area & Dimensions Calculator",
      desc:
        lang === "mr"
          ? "आयताकृती लांबी आणि रुंदी (फूट, मीटर, गज) वरून चौरस फूट, गुंठा, एकर, बिघा आणि परिमिती मोजा."
          : lang === "hi"
          ? "आयताकार भूखंड (लंबाई × चौड़ाई) से वर्ग फीट, वर्ग मीटर, गज, एकड़, गुंठा और बीघा का तत्काल रूपांतरण।"
          : "Calculate rectangular land parcels from Length × Width across feet, metres, yards, and convert instantly into sq ft, Acre, Guntha, and Bigha.",
      path: `${langPrefix}/tools/plot-area-calculator`,
      icon: Ruler,
      highlight: lang === "mr" ? "लांबी × रुंदी आणि भूखंड भूमिती" : lang === "hi" ? "लंबाई × चौड़ाई व भूखंड ज्यामिति" : "Length × Width with 2D Schematic",
    },
    {
      id: "compound-units",
      title:
        lang === "mr"
          ? "मिश्रित पारंपारिक एकक कन्व्हर्टर (Compound Units)"
          : lang === "hi"
          ? "मिश्रित पारंपरिक इकाई परिवर्तक (Compound Units)"
          : "Compound Traditional Unit Converter",
      desc:
        lang === "mr"
          ? "बिघा-बिस्वा-बिस्वांसी, बिघा-कठ्ठा-धूर आणि एकर-गुंठा-आना यांसारख्या बहुस्तरीय पारंपारिक प्रणालींचे अचूक रूपांतरण."
          : lang === "hi"
          ? "बीघा-बिस्वा-बिस्वांसी, बीघा-कट्ठा-धूर और एकड़-गुंठा-आना जैसी बहुस्तरीय पारंपरिक प्रणालियों का द्वि-दिशात्मक रूपांतरण।"
          : "Convert multi-tier traditional revenue subdivisions like Bigha-Biswa-Biswansi, Bigha-Kattha-Dhur, and Acre-Guntha into total square feet and vice versa.",
      path: `${langPrefix}/tools/compound-land-unit-converter`,
      icon: Layers,
      highlight: lang === "mr" ? "उप-घटक विभाजन आणि रिव्हर्स डिकम्पोझिशन" : lang === "hi" ? "उप-इकाई विभाजन व विपरीत रूपांतरण" : "Composite Subunits & Reverse Decomposition",
    },
    {
      id: "unit-comparison",
      title:
        lang === "mr"
          ? "प्रादेशिक जमीन एकक तुलना मॅट्रिक्स (Comparison Matrix)"
          : lang === "hi"
          ? "क्षेत्रीय भूमि इकाई तुलना मैट्रिक्स (Comparison Matrix)"
          : "Regional Land Unit Comparison Matrix",
      desc:
        lang === "mr"
          ? "विविध राज्यांमधील बिघा, गुंठा, बिस्वा आणि कनाल यांच्या क्षेत्रफळ तफावतीची अधिकृत व पारंपारिक पुराव्यासह तुलना."
          : lang === "hi"
          ? "विभिन्न राज्यों में बीघा, गुंठा, बिस्वा और कनाल के क्षेत्रफल में भिन्नताओं की आधिकारिक व पारंपरिक संदर्भ सहित तुलना।"
          : "Compare how customary units like Bigha, Guntha, Biswa, and Kanal differ across 16+ Indian states with legal citations and standard square feet benchmarks.",
      path: `${langPrefix}/tools/land-unit-comparison`,
      icon: BarChart3,
      highlight: lang === "mr" ? "राज्यनिहाय बिघा आणि गुंठा विश्लेषण" : lang === "hi" ? "राज्यवार बीघा व गुंठा विश्लेषण" : "State-by-State Bigha & Guntha Benchmark",
    },
    {
      id: "custom-factor",
      title:
        lang === "mr"
          ? "कस्टम जमीन एकक कॅल्क्युलेटर (Custom Unit Manager)"
          : lang === "hi"
          ? "कस्टम भूमि इकाई कैलकुलेटर (Custom Unit Manager)"
          : "Custom Land Unit Calculator & Factor Manager",
      desc:
        lang === "mr"
          ? "स्थानिक गावातील किंवा तालुकानिहाय पारंपारिक एकक स्वतः जोडा आणि संपूर्ण पोर्टलमध्ये त्याचे अचूक रूपांतरण करा."
          : lang === "hi"
          ? "अपने क्षेत्र या गांव की स्थानीय पारंपरिक इकाई का गुणक स्वयं परिभाषित करें और तुरंत रूपांतरण परिणाम देखें।"
          : "Define your own local or hyper-regional land measurement factors, store them securely in browser memory, and apply them across conversions.",
      path: `${langPrefix}/tools/custom-land-unit-calculator`,
      icon: Sliders,
      highlight: lang === "mr" ? "स्थानिक महसूल घटक आणि खाजगी संचयन" : lang === "hi" ? "स्थानीय राजस्व गुणक व निजी संचयन" : "Client-Side Local Storage & Formula Preview",
    },
  ];

  const conversionLinks = [
    {
      title:
        lang === "mr"
          ? "एकर ते चौरस फूट (Acre to Sq Ft)"
          : lang === "hi"
          ? "एकड़ से वर्ग फीट (Acre to Sq Ft)"
          : "Acre to Square Feet (sq ft)",
      path: "/convert/acre-to-sqft",
    },
    {
      title:
        lang === "mr"
          ? "हेक्टर ते एकर (Hectare to Acre)"
          : lang === "hi"
          ? "हेक्टेयर से एकड़ (Hectare to Acre)"
          : "Hectare to Acre (National Standard)",
      path: "/convert/hectare-to-acre",
    },
    {
      title:
        lang === "mr"
          ? "एकर ते गुंठा (महाराष्ट्र / 7/12)"
          : lang === "hi"
          ? "एकड़ से गुंठा (महाराष्ट्र / 7/12)"
          : "Acre to Guntha (Maharashtra)",
      path: "/convert/acre-to-guntha/maharashtra",
    },
    {
      title:
        lang === "mr"
          ? "गुंठा ते चौरस फूट (महाराष्ट्र)"
          : lang === "hi"
          ? "गुंठा से वर्ग फीट (महाराष्ट्र)"
          : "Guntha to Square Feet (Maharashtra)",
      path: "/convert/guntha-to-sqft/maharashtra",
    },
    {
      title:
        lang === "mr"
          ? "एकर ते बीघा (उत्तर प्रदेश)"
          : lang === "hi"
          ? "एकड़ से बीघा (उत्तर प्रदेश)"
          : "Acre to Bigha (Uttar Pradesh)",
      path: "/convert/acre-to-bigha/uttar-pradesh",
    },
    {
      title:
        lang === "mr"
          ? "बीघा ते कट्ठा (पश्चिम बंगाल)"
          : lang === "hi"
          ? "बीघा से कट्ठा (पश्चिम बंगाल)"
          : "Bigha to Kattha (West Bengal)",
      path: "/convert/bigha-to-kattha/west-bengal",
    },
    {
      title:
        lang === "mr"
          ? "कनाल ते मरला (पंजाब व हरियाणा)"
          : lang === "hi"
          ? "कनाल से मरला (पंजाब एवं हरियाणा)"
          : "Kanal to Marla (Punjab & Haryana)",
      path: "/convert/kanal-to-marla/punjab",
    },
    {
      title:
        lang === "mr"
          ? "ग्राउंड ते चौरस फूट (तमिळनाडू)"
          : lang === "hi"
          ? "ग्राउंड से वर्ग फीट (तमिलनाडु)"
          : "Ground to Sq Ft (Tamil Nadu)",
      path: "/convert/ground-to-sqft/tamil-nadu",
    },
  ];

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
        name: lang === "mr" ? "उपकरण केंद्र" : lang === "hi" ? "उपकरण केंद्र" : "Tools Hub",
        item: `${SITE_URL}${langPrefix}/tools`,
      },
    ],
  };

  return (
    <main className="container max-w-4xl px-4 py-6 sm:py-8 space-y-8">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to={`${langPrefix}/`} className="hover:text-foreground transition-colors">
          {t("home", lang)}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-foreground">
          {lang === "mr" ? "उपकरण केंद्र" : lang === "hi" ? "उपकरण केंद्र" : "Tools Hub"}
        </span>
      </nav>

      {/* Hero Header */}
      <div className="space-y-2 border-b border-border/60 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Calculator className="h-3.5 w-3.5" />
          <span>
            {lang === "mr"
              ? "विशेष जमीन मोजमाप साधने"
              : lang === "hi"
              ? "विशिष्ट भूमि मापन उपकरण"
              : "Dedicated Land Measurement Tools"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {lang === "mr"
            ? "भारतीय जमीन मोजमाप साधने व कॅल्क्युलेटर"
            : lang === "hi"
            ? "भारतीय भूमि मापन उपकरण एवं कैलकुलेटर केंद्र"
            : "Indian Land Measurement Tools & Calculators Hub"}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {lang === "mr"
            ? "प्लॉटचे आकारमान, पारंपारिक बहुस्तरीय एकके, राज्यनिहाय बिघा तुलना आणि स्थानिक महसूल गुणकांसाठी डिझाइन केलेली स्वतंत्र साधने."
            : lang === "hi"
            ? "भूखंड विमा, पारंपरिक बहुस्तरीय इकाइयां, राज्यवार बीघा तुलना और स्थानीय राजस्व गुणकों के लिए समर्पित स्वतंत्र उपकरण।"
            : "Explore specialized, client-side calculation engines for plot dimensions, traditional compound subdivisions, state-wise unit variations, and custom local revenue factors."}
        </p>
      </div>

      {/* 4 Dedicated Tools Grid */}
      <section aria-labelledby="tools-grid-heading" className="space-y-4">
        <h2 id="tools-grid-heading" className="text-lg font-bold text-foreground flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          <span>
            {lang === "mr" ? "उपलब्ध विशेष साधने" : lang === "hi" ? "उपलब्ध विशिष्ट उपकरण" : "Available Specialized Tools"}
          </span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <div
                key={tool.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {tool.highlight}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      <Link to={tool.path} className="focus:outline-none">
                        <span className="absolute inset-0 rounded-2xl" aria-hidden="true" />
                        {tool.title}
                      </Link>
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>{lang === "mr" ? "उपकरण उघडा" : lang === "hi" ? "टूल खोलें" : "Launch Tool"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Land Conversion Links */}
      <section aria-labelledby="conversion-links-heading" className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 id="conversion-links-heading" className="text-base font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span>
            {lang === "mr" ? "लोकप्रिय राज्यनिहाय रूपांतरणे" : lang === "hi" ? "लोकप्रिय राज्यवार रूपांतरण" : "Popular Regional Conversion Guides"}
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {conversionLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted text-foreground transition-colors"
            >
              <span className="font-medium">{item.title}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Cadastral & Legal Context Guide */}
      <section aria-labelledby="cadastral-guide-heading" className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-5 text-xs text-muted-foreground leading-relaxed">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h2 id="cadastral-guide-heading">
            {lang === "mr"
              ? "भारतीय जमीन महसूल मोजमाप मार्गदर्शक"
              : lang === "hi"
              ? "भारतीय भू-राजस्व मापन मार्गदर्शिका"
              : "Understanding Indian Cadastral Standards & Revenue Records"}
          </h2>
        </div>
        <p>
          {lang === "mr"
            ? "भारतात केंद्र सरकारच्या मानकीकरण कायद्यानुसार मेट्रिक पद्धत (हेक्टर व चौरस मीटर) अधिकृत मानली जाते. तथापि, राज्यातील जुन्या ७/१२, खतावणी किंवा फेरफार नोंदींमध्ये बिघा, गुंठा, बिस्वा, कनाल आणि कट्ठा या पारंपारिक एककांचा सर्रास वापर आढळतो."
            : lang === "hi"
            ? "भारत में मानक माप प्रणाली के अनुसार मीट्रिक प्रणाली (हेक्टेयर एवं वर्ग मीटर) आधिकारिक है। तथापि, राज्यों के ऐतिहासिक खतौनी, जमाबंदी व अभिलेखों में बीघा, गुंठा, बिस्वा, कनाल और कट्ठा जैसी पारंपरिक इकाइयों का व्यापक उपयोग होता है।"
            : "Under the Standards of Weights and Measures Act (1976), the Metric system (Hectares, Square Metres) is India's legal standard. However, state cadastral survey maps (Shajra / Naksha), Records of Rights (RoR / Khatauni / 7/12), and rural registry deeds widely quote traditional benchmarks like Bigha, Guntha, Biswa, and Kanal."}
        </p>
        <div className="pt-2 flex items-center gap-2 text-[11px] text-muted-foreground/80">
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span>
            {lang === "mr"
              ? "सर्व गणना 100% क्लायंट-साइड चालतात. कोणताही डेटा बाह्य सर्व्हरवर पाठवला जात नाही."
              : lang === "hi"
              ? "सभी गणनाएं 100% क्लाइंट-साइड चलती हैं। कोई भी व्यक्तिगत डेटा सर्वर पर नहीं भेजा जाता।"
              : "All tools execute entirely in your browser without tracking or transmitting personal land parcel dimensions."}
          </span>
        </div>
      </section>
    </main>
  );
}

export default function ToolsHubPage({ forcedLang }: ToolsHubPageProps) {
  return (
    <AppProvider initialLang={forcedLang}>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <ToolsHubContent />
        <Footer />
      </div>
    </AppProvider>
  );
}

