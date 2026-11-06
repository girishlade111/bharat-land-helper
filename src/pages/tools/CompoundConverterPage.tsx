import React from "react";
import { Link } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompoundUnitConverter from "@/components/CompoundUnitConverter";
import { SITE_URL } from "@/config/site";
import { t } from "@/data/translations";
import {
  ChevronRight,
  Layers,
  BookOpen,
  Split,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface ToolPageProps {
  forcedLang?: "en" | "hi" | "mr";
}

function CompoundConverterContent() {
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
            ? "मिश्रित पारंपारिक एकक कन्व्हर्टर"
            : lang === "hi"
            ? "मिश्रित पारंपरिक इकाई परिवर्तक"
            : "Compound Land Unit Converter",
        item: `${SITE_URL}${langPrefix}/tools/compound-land-unit-converter`,
      },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name:
      lang === "mr"
        ? "मिश्रित पारंपारिक एकक कन्व्हर्टर - भारत लँड कन्व्हर्टर"
        : lang === "hi"
        ? "मिश्रित पारंपरिक इकाई परिवर्तक - भारत लैंड कनवर्टर"
        : "Compound Land Unit Converter - Bharat Land Converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All modern web browsers",
    url: `${SITE_URL}${langPrefix}/tools/compound-land-unit-converter`,
    description:
      "Convert multi-tier traditional Indian land units like Bigha-Biswa-Biswansi, Bigha-Kattha-Dhur, Acre-Guntha into square feet and reverse decompose total area into composite units.",
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

      {/* Breadcrumbs */}
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
            ? "मिश्रित पारंपारिक एकक कन्व्हर्टर"
            : lang === "hi"
            ? "मिश्रित पारंपरिक इकाई परिवर्तक"
            : "Compound Unit Converter"}
        </span>
      </nav>

      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {lang === "mr"
            ? "मिश्रित पारंपारिक जमीन एकक कन्व्हर्टर (Compound Land Units)"
            : lang === "hi"
            ? "मिश्रित पारंपरिक भूमि इकाई परिवर्तक (Compound Land Units)"
            : "Compound Traditional Land Unit Converter"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {lang === "mr"
            ? "उत्तर, पूर्व आणि पश्चिम भारतातील बहुस्तरीय पारंपारिक महसूल एकके (जसे की २ बिघा ५ बिस्वा १० बिस्वांसी किंवा १ एकर २० गुंठा) एकूण चौरस फूट, एकर व हेक्टरमध्ये रूपांतरित करा, तसेच रिव्हर्स डिकम्पोझिशन करा."
            : lang === "hi"
            ? "उत्तर, पूर्व व पश्चिम भारत की बहुस्तरीय पारंपरिक राजस्व इकाइयाँ (जैसे २ बीघा ५ बिस्वा १० बिस्वांसी अथवा १ एकड़ २० गुंठा) कुल वर्ग फीट, एकड़ व हेक्टेयर में परिवर्तित करें एवं विपरीत विभाजन देखें।"
            : "Convert multi-tier traditional revenue subdivisions like Bigha-Biswa-Biswansi, Bigha-Kattha-Dhur, and Acre-Guntha into standard square feet, and decompose any standard land area back into traditional subunits."}
        </p>
      </div>

      {/* Embedded Converter Component */}
      <CompoundUnitConverter />

      {/* Architectural & Domain Explanation */}
      <section aria-labelledby="systems-heading" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <h2 id="systems-heading" className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span>
            {lang === "mr"
              ? "भारतातील प्रमुख बहुस्तरीय पारंपारिक महसूल प्रणाली"
              : lang === "hi"
              ? "भारत की प्रमुख बहुस्तरीय पारंपरिक राजस्व प्रणालियाँ"
              : "Major Traditional Compound Measurement Hierarchies"}
          </span>
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
            <span className="font-bold text-foreground text-sm block">1. Uttar Pradesh / Delhi (Pucca System)</span>
            <p className="text-muted-foreground">
              <strong>1 Pucca Bigha</strong> = 20 Biswa = 400 Biswansi = 27,225 sq ft (3,025 sq yd = 55 yd × 55 yd Gunter jarib square).
            </p>
            <p className="text-muted-foreground text-[11px]">
              • 1 Biswa = 1,361.25 sq ft<br />
              • 1 Biswansi = 68.0625 sq ft
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
            <span className="font-bold text-foreground text-sm block">2. Bihar & Eastern UP (Standard Kattha)</span>
            <p className="text-muted-foreground">
              <strong>1 Bigha</strong> = 20 Kattha = 400 Dhur = 27,225 sq ft.
            </p>
            <p className="text-muted-foreground text-[11px]">
              • 1 Kattha = 1,361.25 sq ft (20 Dhur)<br />
              • 1 Dhur = 68.0625 sq ft (20 Dhurki)
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
            <span className="font-bold text-foreground text-sm block">3. West Bengal (Standard Bengali System)</span>
            <p className="text-muted-foreground">
              <strong>1 Bigha</strong> = 20 Kattha = 320 Chatak = 14,400 sq ft (1,600 sq yd).
            </p>
            <p className="text-muted-foreground text-[11px]">
              • 1 Kattha (Cottah) = 720 sq ft (16 Chataks)<br />
              • 1 Chatak = 45 sq ft
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
            <span className="font-bold text-foreground text-sm block">4. Punjab & Haryana (Traditional Ghumaon)</span>
            <p className="text-muted-foreground">
              <strong>1 Ghumaon (Acre)</strong> = 8 Kanal = 160 Marla = 43,560 sq ft.
            </p>
            <p className="text-muted-foreground text-[11px]">
              • 1 Kanal = 5,445 sq ft (20 Marla)<br />
              • 1 Marla = 272.25 sq ft (9 Sarsahi)
            </p>
          </div>
        </div>
      </section>

      {/* Cadastral vs Registry Discrepancy Note */}
      <section className="space-y-2 rounded-2xl border border-border/60 bg-muted/30 p-5 text-xs text-muted-foreground leading-relaxed">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h3>Why Registry Deeds Quote Compound Units While Online RoR Quotes Decimals</h3>
        </div>
        <p>
          In modern state land registries (e.g., UP Bhulekh, Bihar Bhumi, MahaBhulekh), official computerized records record parcels in Metric Hectares (e.g. 0.4047 ha) or decimal Acres. However, ancestral sale deeds (Bainama), partition decrees (Bantwara), and local agricultural agreements retain traditional compound units (e.g. "२ बीघा, ४ बिस्वा").
        </p>
        <p>
          This compound unit converter bridges this gap by calculating the exact decimal and metric equivalent of ancestral parcel descriptions.
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
            <span className="font-semibold text-foreground">Regional Unit Matrix</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Link>
          <Link
            to="/convert/acre-to-bigha/uttar-pradesh"
            className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-foreground">Acre to Bigha (UP)</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function CompoundConverterPage({ forcedLang }: ToolPageProps) {
  return (
    <AppProvider initialLang={forcedLang}>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <CompoundConverterContent />
        <Footer />
      </div>
    </AppProvider>
  );
}

