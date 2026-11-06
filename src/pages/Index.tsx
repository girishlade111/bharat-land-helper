import { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import ConverterInput from "@/components/ConverterInput";
import FilterTabs from "@/components/FilterTabs";
import ResultsGrid from "@/components/ResultsGrid";
import AreaVisual from "@/components/AreaVisual";
import RateCalculator from "@/components/RateCalculator";
import ShareButtons from "@/components/ShareButtons";
import MyLandList from "@/components/MyLandList";
import QuickReference from "@/components/QuickReference";
import UnitSearch from "@/components/UnitSearch";
import ComparisonMode from "@/components/ComparisonMode";
import PlotCalculator from "@/components/PlotCalculator";
import CompoundUnitConverter from "@/components/CompoundUnitConverter";
import CustomUnitManager from "@/components/CustomUnitManager";
import RegionalComparison from "@/components/RegionalComparison";
import ConversionHistory from "@/components/ConversionHistory";
import Footer from "@/components/Footer";
import { t } from "@/data/translations";
import {
  AlertCircle,
  ShieldCheck,
  ArrowRightLeft,
  Ruler,
  Layers,
  BarChart3,
  Sliders,
  History,
} from "lucide-react";

type ActiveTool = "converter" | "plot" | "compound" | "compare" | "custom" | "history";

function MainContent() {
  const { lang, selectedRegion } = useApp();
  const [activeTool, setActiveTool] = useState<ActiveTool>("converter");

  return (
    <main className="container max-w-4xl px-4 py-5 space-y-5 sm:py-6 sm:space-y-6">
      {/* Primary Hero Heading for SEO and Hierarchy */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {lang === "hi" ? "भारत भूमि क्षेत्रफल परिवर्तक" : "Bharat Land Area Converter"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {lang === "hi"
            ? "बीघा, गुंठा, एकड़, हेक्टेयर, कनाल, मरला और 35+ इकाइयों का सटीक रूपांतरण"
            : "Accurate land measurement converter for Bigha, Guntha, Acre, Hectare, Kanal, Marla, and 35+ units across all Indian states"}
        </p>
      </div>

      {/* Top Utility Tool Switcher Navigation */}
      <nav
        aria-label="Land Measurement Tools Navigation"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/60"
      >
        <button
          id="tab-converter-btn"
          type="button"
          onClick={() => setActiveTool("converter")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTool === "converter"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>{lang === "hi" ? "क्षेत्रफल परिवर्तक" : "Area Converter"}</span>
        </button>

        <button
          id="tab-plot-btn"
          type="button"
          onClick={() => setActiveTool("plot")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTool === "plot"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Ruler className="h-4 w-4" />
          <span>{lang === "hi" ? "भूखंड आयाम" : "Plot Dimensions"}</span>
        </button>

        <button
          id="tab-compound-btn"
          type="button"
          onClick={() => setActiveTool("compound")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTool === "compound"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>{lang === "hi" ? "मिश्रित इकाइयाँ" : "Compound Units"}</span>
        </button>

        <button
          id="tab-compare-btn"
          type="button"
          onClick={() => setActiveTool("compare")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTool === "compare"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>{lang === "hi" ? "इकाई तुलना" : "Unit Comparison"}</span>
        </button>

        <button
          id="tab-custom-btn"
          type="button"
          onClick={() => setActiveTool("custom")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTool === "custom"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>{lang === "hi" ? "कस्टम इकाई" : "Custom Factor"}</span>
        </button>

        <button
          id="tab-history-btn"
          type="button"
          onClick={() => setActiveTool("history")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTool === "history"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <History className="h-4 w-4" />
          <span>{lang === "hi" ? "इतिहास एवं सहेजे गए" : "History & Saved"}</span>
        </button>
      </nav>

      {/* TOOL VIEW: 1. Primary Area Converter */}
      {activeTool === "converter" && (
        <div className="space-y-5 animate-fade-in">
          {/* Primary Converter (From/To, Direct Result, Formula, Confidence) */}
          <ConverterInput />

          {/* Filter Tabs */}
          <FilterTabs />

          {/* Results Grid + Area Visualizer */}
          <div className="grid gap-4 lg:grid-cols-[1fr_220px] sm:gap-5">
            <ResultsGrid />
            <div className="space-y-4">
              <AreaVisual />
              <ShareButtons />
            </div>
          </div>

          {/* Interactive Searchable Unit Selector */}
          <UnitSearch />

          {/* Land Valuation Rate Calculator */}
          <RateCalculator />

          {/* Saved Parcels List */}
          <MyLandList />

          {/* Cross-State Bigha Comparison */}
          <ComparisonMode />

          {/* Quick Reference Conversion Tables */}
          <QuickReference />
        </div>
      )}

      {/* TOOL VIEW: 2. Plot Dimensions Calculator */}
      {activeTool === "plot" && (
        <div className="animate-fade-in">
          <PlotCalculator onTransferToConverter={() => setActiveTool("converter")} />
        </div>
      )}

      {/* TOOL VIEW: 3. Compound Traditional Unit Converter */}
      {activeTool === "compound" && (
        <div className="animate-fade-in">
          <CompoundUnitConverter onTransferToConverter={() => setActiveTool("converter")} />
        </div>
      )}

      {/* TOOL VIEW: 4. Regional Unit Comparison Matrix */}
      {activeTool === "compare" && (
        <div className="animate-fade-in">
          <RegionalComparison />
        </div>
      )}

      {/* TOOL VIEW: 5. Custom Local Measurement Factor */}
      {activeTool === "custom" && (
        <div className="animate-fade-in">
          <CustomUnitManager onApplyCustomUnit={() => setActiveTool("converter")} />
        </div>
      )}

      {/* TOOL VIEW: 6. Conversion History & Saved Parcels */}
      {activeTool === "history" && (
        <div className="space-y-5 animate-fade-in">
          <ConversionHistory onLoadConversion={() => setActiveTool("converter")} />
          <MyLandList />
        </div>
      )}

      {/* Visible Legal Disclaimer on Customary Units */}
      <section
        aria-label="Legal Notice"
        className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 sm:p-5 text-xs text-foreground/80 space-y-1.5"
      >
        <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{t("disclaimerTitle", lang)}</span>
        </div>
        <p className="leading-relaxed">
          {t("disclaimerText", lang)}
        </p>
        <div className="pt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {lang === "hi"
              ? `${selectedRegion.nameHi} भू-अभिलेख: ${selectedRegion.officialSystemHi}`
              : `${selectedRegion.name} Revenue System: ${selectedRegion.officialSystem}`}
          </span>
        </div>
      </section>
    </main>
  );
}

export default function Index() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <MainContent />
        <Footer />
      </div>
    </AppProvider>
  );
}
