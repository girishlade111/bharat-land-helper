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
import Footer from "@/components/Footer";
import { t } from "@/data/translations";
import { AlertCircle, ShieldCheck } from "lucide-react";

function MainContent() {
  const { lang, selectedRegion } = useApp();

  return (
    <main className="container max-w-4xl px-4 py-5 space-y-5 sm:py-6 sm:space-y-6">
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
