import React from "react";
import { Link } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomUnitManager from "@/components/CustomUnitManager";
import { SITE_URL } from "@/config/site";
import { t } from "@/data/translations";
import {
  ChevronRight,
  Sliders,
  ShieldAlert,
  Info,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface ToolPageProps {
  forcedLang?: "en" | "hi" | "mr";
}

function CustomUnitCalculatorContent() {
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
            ? "कस्टम जमीन एकक कॅल्क्युलेटर"
            : lang === "hi"
            ? "कस्टम भूमि इकाई कैलकुलेटर"
            : "Custom Land Unit Calculator",
        item: `${SITE_URL}${langPrefix}/tools/custom-land-unit-calculator`,
      },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name:
      lang === "mr"
        ? "कस्टम जमीन एकक कॅल्क्युलेटर - भारत लँड कन्व्हर्टर"
        : lang === "hi"
        ? "कस्टम भूमि इकाई कैलकुलेटर - भारत लैंड कनवर्टर"
        : "Custom Land Unit Calculator - Bharat Land Converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All modern web browsers",
    url: `${SITE_URL}${langPrefix}/tools/custom-land-unit-calculator`,
    description:
      "Define and manage hyper-local Indian land measurement units, configure exact conversion factors to square feet, and test instant bidirectional calculations.",
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
            ? "कस्टम जमीन एकक कॅल्क्युलेटर"
            : lang === "hi"
            ? "कस्टम भूमि इकाई कैलकुलेटर"
            : "Custom Unit Calculator"}
        </span>
      </nav>

      {/* Page Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {lang === "mr"
            ? "कस्टम जमीन एकक कॅल्क्युलेटर व फॅक्टर मॅनेजर"
            : lang === "hi"
            ? "कस्टम भूमि इकाई कैलकुलेटर एवं फैक्टर मैनेजर"
            : "Custom Land Unit Calculator & Factor Manager"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {lang === "mr"
            ? "तुमच्या गावातील किंवा विशिष्ट भागातील स्थानिक पारंपारिक एकक (जसे की स्थानिक बिघा, कानी किंवा चटक) स्वतः परिभाषित करा. चौरस फूट गुणक निश्चित करा आणि संपूर्ण प्रणालीमध्ये त्याचा वापर करा."
            : lang === "hi"
            ? "अपने गांव या विशिष्ट तहसील की स्थानीय पारंपरिक इकाई (जैसे स्थानीय कच्चा बीघा, कानी या चटक) को स्वयं परिभाषित करें, वर्ग फीट गुणक दर्ज करें और तुरंत रूपांतरण करें।"
            : "Define hyper-local or customary land measurement units unique to your tehsil or village. Set exact conversion factors into square feet, preview calculations in real time, and persist them safely in local browser storage."}
        </p>
      </div>

      {/* Embedded Custom Unit Manager Component */}
      <CustomUnitManager />

      {/* Legal & Usage Warnings */}
      <section aria-labelledby="custom-warning-heading" className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-xs leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-sm">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <h2 id="custom-warning-heading">
            {lang === "mr"
              ? "स्थानिक कस्टम एककांबाबत महत्त्वाची कायदेशीर सूचना"
              : lang === "hi"
              ? "स्थानीय कस्टम इकाइयों हेतु महत्वपूर्ण कानूनी चेतावनी"
              : "Important Cadastral & Legal Notice on Custom Units"}
          </h2>
        </div>
        <p className="text-foreground/80">
          {lang === "mr"
            ? "कस्टम एकके केवळ वापरकर्त्याच्या ब्राऊझरमध्ये स्थानिक पातळीवर (LocalStorage) साठवली जातात. ती कायदेशीर किंवा सरकारी प्रमाणित महसूल नोंदींचा भाग नाहीत. कोणत्याही जमिनीच्या खरेदी-विक्रीपूर्वी स्थानिक तलाठी, पटवारी किंवा तहसीलदार यांच्याकडून अधिकृत मोजमापाची खात्री करून घ्यावी."
            : lang === "hi"
            ? "कस्टम इकाइयां केवल आपके ब्राउज़र के लोकल स्टोरेज में सहेजी जाती हैं। ये किसी सरकारी या विधिक प्रमाण का विकल्प नहीं हैं। किसी भी भूमि सौदे या रजिस्ट्री से पूर्व स्थानीय पटवारी, कानूनगो या तहसीलदार से आधिकारिक माप की पुष्टि अवश्य करें।"
            : "Custom units are stored purely on your local device (browser LocalStorage). They are not official statutory standards. Always cross-verify hyper-local customary factors with your local Patwari, Talathi, or Revenue Tehsildar before executing registered sale deeds or land agreements."}
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
            <span className="font-semibold text-foreground">Plot Area Calculator</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Link>
          <Link
            to={`${langPrefix}/tools/land-unit-comparison`}
            className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-foreground">Land Unit Comparison</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Link>
          <Link
            to={`${langPrefix}/tools/compound-land-unit-converter`}
            className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-foreground">Compound Converter</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function CustomUnitCalculatorPage({ forcedLang }: ToolPageProps) {
  return (
    <AppProvider initialLang={forcedLang}>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <CustomUnitCalculatorContent />
        <Footer />
      </div>
    </AppProvider>
  );
}
