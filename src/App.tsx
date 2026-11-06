import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import ConversionLanding from "./pages/ConversionLanding";
import ToolsHubPage from "./pages/tools/ToolsHubPage";
import PlotAreaCalculatorPage from "./pages/tools/PlotAreaCalculatorPage";
import CompoundConverterPage from "./pages/tools/CompoundConverterPage";
import LandUnitComparisonPage from "./pages/tools/LandUnitComparisonPage";
import CustomUnitCalculatorPage from "./pages/tools/CustomUnitCalculatorPage";
import { CONVERSION_ROUTES } from "./data/seoRoutes";

export function AppRoutes() {
  return (
    <Routes>
      {/* English Core Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />

      {/* English Standalone Dedicated Tool Routes */}
      <Route path="/tools" element={<ToolsHubPage />} />
      <Route path="/tools/plot-area-calculator" element={<PlotAreaCalculatorPage />} />
      <Route path="/tools/compound-land-unit-converter" element={<CompoundConverterPage />} />
      <Route path="/tools/land-unit-comparison" element={<LandUnitComparisonPage />} />
      <Route path="/tools/custom-land-unit-calculator" element={<CustomUnitCalculatorPage />} />

      {/* Hindi (hi) Localized Routes */}
      <Route path="/hi" element={<Index forcedLang="hi" />} />
      <Route path="/hi/tools" element={<ToolsHubPage forcedLang="hi" />} />
      <Route path="/hi/tools/plot-area-calculator" element={<PlotAreaCalculatorPage forcedLang="hi" />} />
      <Route path="/hi/tools/compound-land-unit-converter" element={<CompoundConverterPage forcedLang="hi" />} />
      <Route path="/hi/tools/land-unit-comparison" element={<LandUnitComparisonPage forcedLang="hi" />} />
      <Route path="/hi/tools/custom-land-unit-calculator" element={<CustomUnitCalculatorPage forcedLang="hi" />} />

      {/* Marathi (mr) Localized Routes */}
      <Route path="/mr" element={<Index forcedLang="mr" />} />
      <Route path="/mr/tools" element={<ToolsHubPage forcedLang="mr" />} />
      <Route path="/mr/tools/plot-area-calculator" element={<PlotAreaCalculatorPage forcedLang="mr" />} />
      <Route path="/mr/tools/compound-land-unit-converter" element={<CompoundConverterPage forcedLang="mr" />} />
      <Route path="/mr/tools/land-unit-comparison" element={<LandUnitComparisonPage forcedLang="mr" />} />
      <Route path="/mr/tools/custom-land-unit-calculator" element={<CustomUnitCalculatorPage forcedLang="mr" />} />

      {/* 8 Explicit Candidate Conversion Landing Routes */}
      {CONVERSION_ROUTES.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<ConversionLanding />}
        />
      ))}

      {/* Dynamic catch for any future /convert/* route */}
      <Route path="/convert/*" element={<ConversionLanding />} />

      {/* 404 Not Found */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {children}
      <Analytics />
    </TooltipProvider>
  );
}

const App = () => (
  <AppShell>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AppShell>
);

export default App;
