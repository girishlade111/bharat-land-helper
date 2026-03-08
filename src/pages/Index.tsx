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
        <main className="container max-w-4xl px-4 py-6 space-y-6">
          {/* Main Converter */}
          <ConverterInput />

          {/* Filter Tabs */}
          <FilterTabs />

          {/* Results Grid + Area Visual */}
          <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
            <ResultsGrid />
            <div className="space-y-4">
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
