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
import { CONVERSION_ROUTES } from "./data/seoRoutes";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />

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
