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
            Unlike modern standardized metric measures (1 Hectare = 10,000 sq m everywhere), traditional Indian land units evolved through regional revenue settlements over hundreds of years:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
            <li>
              <strong>Mughal Ilahi Gaz & Gunter's Chain:</strong> In northern provinces (UP, Bihar, parts of Punjab), revenue officials standardized the Bigha to a square of 55 yards × 55 yards (3,025 square yards = 27,225 square feet), known as the Pucca Bigha.
            </li>
            <li>
              <strong>Bengal Permanent Settlement (1793):</strong> In Bengal Presidency (West Bengal, parts of Assam), the British East India Company standardized the Bigha to 120 ft × 120 ft (14,400 sq ft or 1,600 sq yd), creating the distinct Bengal Bigha equal to roughly one-third of an acre.
            </li>
            <li>
              <strong>Princely State Customary Variations (Madhya Pradesh & Rajasthan):</strong> Regions administered by princely states used local measuring rods (Gatha / Latha) of varying lengths (e.g., Gwalior's 12,000 sq ft Bigha vs Central India / Malwa's 27,225 sq ft Bigha).
            </li>
            <li>
              <strong>Western India (Maharashtra & Gujarat):</strong> The Bombay Land Revenue Code standardized the Guntha at exactly 33 ft × 33 ft = 1,089 sq ft (121 sq yd), with exactly 40 Gunthas constituting one standard imperial acre.
            </li>
          </ul>
        </div>
      </section>

      {/* Madhya Pradesh Provenance Notice */}
      <section className="space-y-2.5 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 text-xs text-foreground/80 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-sm">
          <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <h3>Provenance Note on Madhya Pradesh Bigha</h3>
        </div>
        <p>
          Official computerized land records in Madhya Pradesh (MP Bhulekh) record parcels strictly in Metric Hectares and Ares. The Madhya Pradesh Land Revenue Code, 1959 governs survey administration, tenure, and revenue recovery, but does not define a statutory Bigha conversion.
        </p>
        <p>
          The benchmarks presented here (27,225 sq ft Standard/Malwa Bigha and 12,000 sq ft Gwalior Bigha) represent widely used customary revenue conversion factors preserved in local Patwari practice, registry deeds, and agricultural trade.
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
            to={`${langPrefix}/tools/compound-land-unit-converter`}
            className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-foreground">Compound Unit Converter</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Link>
          <Link
            to="/convert/acre-to-guntha/maharashtra"
            className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-foreground">Acre to Guntha (MH)</span>
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
