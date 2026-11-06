import React from "react";
import { Link } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlotCalculator from "@/components/PlotCalculator";
import { SITE_URL } from "@/config/site";
import { t } from "@/data/translations";
import {
  ChevronRight,
  Calculator,
  Ruler,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface ToolPageProps {
  forcedLang?: "en" | "hi" | "mr";
}

function PlotAreaCalculatorContent() {
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
            ? "प्लॉट क्षेत्रफळ कॅल्क्युलेटर"
            : lang === "hi"
            ? "भूखंड विमा कैलकुलेटर"
            : "Plot Area Calculator",
        item: `${SITE_URL}${langPrefix}/tools/plot-area-calculator`,
      },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name:
      lang === "mr"
        ? "प्लॉट क्षेत्रफळ कॅल्क्युलेटर - भारत लँड कन्व्हर्टर"
        : lang === "hi"
        ? "भूखंड क्षेत्रफल कैलकुलेटर - भारत लैंड कनवर्टर"
        : "Plot Area Calculator - Bharat Land Converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All modern web browsers",
    url: `${SITE_URL}${langPrefix}/tools/plot-area-calculator`,
    description:
      "Calculate rectangular land parcel area from length and width in feet, metres, yards (gaj) into square feet, acres, guntha, and bigha.",
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
            ? "प्लॉट क्षेत्रफळ कॅल्क्युलेटर"
            : lang === "hi"
            ? "भूखंड विमा कैलकुलेटर"
            : "Plot Area Calculator"}
        </span>
      </nav>

      {/* Page Title & Intro */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {lang === "mr"
            ? "प्लॉट क्षेत्रफळ कॅल्क्युलेटर (लांबी × रुंदी)"
            : lang === "hi"
            ? "भूखंड क्षेत्रफल कैलकुलेटर (लंबाई × चौड़ाई)"
            : "Plot Area Calculator (Rectangular Land Dimensions)"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {lang === "mr"
            ? "आयताकृती जमिनीची लांबी आणि रुंदी फूट, मीटर, गज किंवा इंचामध्ये टाकून तत्काळ चौरस फूट, चौरस मीटर, एकर, गुंठा आणि स्थानिक बिघामध्ये रूपांतरण करा."
            : lang === "hi"
            ? "आयताकार भूमि या प्लॉट की लंबाई और चौड़ाई दर्ज कर तत्काल वर्ग फीट, वर्ग मीटर, गज, एकड़, गुंठा और बीघा में सटीक क्षेत्रफल प्राप्त करें।"
            : "Enter rectangular plot dimensions (Length × Width) in Feet, Metres, Yards (Gaj), or Inches. Get instant multi-unit conversions across Square Feet, Square Metres, Gaj, Acres, Guntha, and Bigha."}
        </p>
      </div>

      {/* Core Embedded Tool Component */}
      <PlotCalculator />

      {/* Technical Reference & Explanations */}
      <section aria-labelledby="formula-heading" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <h2 id="formula-heading" className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          <span>
            {lang === "mr"
              ? "गणितीय सूत्र व मोजमाप प्रमाण"
              : lang === "hi"
              ? "गणितीय सूत्र एवं मापन गुणक"
              : "Mathematical Formula & Conversion Standard"}
          </span>
        </h2>

        <div className="rounded-xl bg-muted/40 p-4 font-mono text-xs sm:text-sm space-y-1.5 border border-border/50">
          <p className="text-primary font-bold">Area (sq ft) = Length (ft) × Width (ft)</p>
          <p className="text-muted-foreground text-xs font-normal">
            {lang === "mr"
              ? "अन्य एककांसाठी: आधी लांबी आणि रुंदी फुटांमध्ये रूपांतरित केली जाते, नंतर एकूण चौरस फूट काढले जातात."
              : lang === "hi"
              ? "अन्य इकाइयों के लिए: लंबाई और चौड़ाई को पहले फीट में बदला जाता है, फिर कुल क्षेत्रफल वर्ग फीट में निकाला जाता है।"
              : "For metric or yard inputs, dimensions are converted to linear feet before multiplying to derive exact standard square feet."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs text-foreground/90 pt-1">
          <div className="p-3 rounded-xl border border-border/60 bg-background/50 space-y-1">
            <span className="font-semibold text-foreground block">
              {lang === "mr" ? "१ चौरस गज (गज़ / Sq Yd)" : lang === "hi" ? "१ वर्ग गज (Gaj / Sq Yd)" : "1 Square Yard (Gaj)"}
            </span>
            <p className="text-muted-foreground">
              = 9 sq ft (3 ft × 3 ft). Commonly used for residential layouts across Delhi, Haryana, Punjab, and Uttar Pradesh.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border/60 bg-background/50 space-y-1">
            <span className="font-semibold text-foreground block">
              {lang === "mr" ? "१ गुंठा (महाराष्ट्र / कर्नाटक)" : lang === "hi" ? "१ गुंठा (महाराष्ट्र / कर्नाटक)" : "1 Guntha (Maharashtra / Karnataka)"}
            </span>
            <p className="text-muted-foreground">
              = 1,089 sq ft (33 ft × 33 ft = 121 sq yd). Exactly 40 Gunthas equal 1 Imperial Acre (43,560 sq ft).
            </p>
          </div>
        </div>
      </section>

      {/* Practical Indian Plot Sizes Reference Table */}
      <section aria-labelledby="examples-heading" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <h2 id="examples-heading" className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          <span>
            {lang === "mr"
              ? "भारतातील प्रचलित निवासी व व्यावसायिक भूखंड आकार"
              : lang === "hi"
              ? "भारत में प्रचलित आवासीय एवं व्यावसायिक भूखंड आकार"
              : "Standard Indian Residential & Commercial Plot Dimensions"}
          </span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-2.5 font-semibold text-foreground">Plot Size (Dimensions)</th>
                <th className="p-2.5 font-semibold text-foreground">Square Feet (sq ft)</th>
                <th className="p-2.5 font-semibold text-foreground">Square Yards (Gaj)</th>
                <th className="p-2.5 font-semibold text-foreground">Guntha (MH)</th>
                <th className="p-2.5 font-semibold text-foreground">Typical Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              <tr>
                <td className="p-2.5 text-foreground font-medium">20 ft × 40 ft</td>
                <td className="p-2.5">800 sq ft</td>
                <td className="p-2.5">88.89 Gaj</td>
                <td className="p-2.5">0.735 Guntha</td>
                <td className="p-2.5 font-sans text-muted-foreground">Small House / 2BHK</td>
              </tr>
              <tr>
                <td className="p-2.5 text-foreground font-medium">30 ft × 40 ft</td>
                <td className="p-2.5">1,200 sq ft</td>
                <td className="p-2.5">133.33 Gaj</td>
                <td className="p-2.5">1.102 Guntha</td>
                <td className="p-2.5 font-sans text-muted-foreground">Standard 30×40 Villa Plot</td>
              </tr>
              <tr>
                <td className="p-2.5 text-foreground font-medium">30 ft × 50 ft</td>
                <td className="p-2.5">1,500 sq ft</td>
                <td className="p-2.5">166.67 Gaj</td>
                <td className="p-2.5">1.377 Guntha</td>
                <td className="p-2.5 font-sans text-muted-foreground">Prime Residential Layout</td>
              </tr>
              <tr>
                <td className="p-2.5 text-foreground font-medium">40 ft × 60 ft</td>
                <td className="p-2.5">2,400 sq ft</td>
                <td className="p-2.5">266.67 Gaj</td>
                <td className="p-2.5">2.204 Guntha</td>
                <td className="p-2.5 font-sans text-muted-foreground">Large Bungalow Plot</td>
              </tr>
              <tr>
                <td className="p-2.5 text-foreground font-medium">60 ft × 100 ft</td>
                <td className="p-2.5">6,000 sq ft</td>
                <td className="p-2.5">666.67 Gaj</td>
                <td className="p-2.5">5.510 Guntha</td>
                <td className="p-2.5 font-sans text-muted-foreground">Commercial / Farmhouse</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Cross Links to Other Tools & Landings */}
      <section className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {lang === "mr" ? "संबंधित साधने व मार्गदर्शक" : lang === "hi" ? "संबंधित उपकरण एवं मार्गदर्शिकाएं" : "Related Tools & Guides"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <Link
            to={`${langPrefix}/tools/compound-land-unit-converter`}
            className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-foreground">Compound Unit Converter</span>
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
            to="/convert/acre-to-sqft"
            className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-foreground">Acre to Square Feet</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function PlotAreaCalculatorPage({ forcedLang }: ToolPageProps) {
  return (
    <AppProvider initialLang={forcedLang}>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <PlotAreaCalculatorContent />
        <Footer />
      </div>
    </AppProvider>
  );
}

