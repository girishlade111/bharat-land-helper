import { AppProvider } from "@/context/AppContext";
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

const Index = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-4xl px-4 py-5 space-y-4 sm:py-6 sm:space-y-5">
          {/* Main Converter */}
          <ConverterInput />

          {/* Filter Tabs */}
          <FilterTabs />

          {/* Results Grid + Area Visual */}
          <div className="grid gap-4 lg:grid-cols-[1fr_200px] sm:gap-5">
            <ResultsGrid />
            <div className="space-y-3">
              <AreaVisual />
              <ShareButtons />
            </div>
          </div>

          {/* Unit Search */}
          <UnitSearch />

          {/* Rate Calculator */}
          <RateCalculator />

          {/* My Land List */}
          <MyLandList />

          {/* Comparison Mode */}
          <ComparisonMode />

          {/* Quick Reference */}
          <QuickReference />
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
};

export default Index;
