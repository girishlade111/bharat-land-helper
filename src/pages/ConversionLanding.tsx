import React from "react";
import { useLocation, Link } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import ConverterInput from "@/components/ConverterInput";
import Footer from "@/components/Footer";
import { getConversionRouteByPath, ConversionRouteData } from "@/data/seoRoutes";
import { SITE_URL } from "@/config/site";
import NotFound from "./NotFound";
import {
  ChevronRight,
  ShieldCheck,
  Calculator,
  ArrowRight,
  HelpCircle,
  Scale,
  ExternalLink,
} from "lucide-react";

function ConversionLandingContent({ route }: { route: ConversionRouteData }) {
  const { setInputValue } = useApp();

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Conversions",
        "item": `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": route.h1,
        "item": route.canonical,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: route.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header />

      <main className="container max-w-4xl px-4 py-5 space-y-6 sm:py-8 sm:space-y-8 flex-1">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-muted-foreground">Conversions</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-foreground font-medium truncate" aria-current="page">
            {route.h1}
          </span>
        </nav>

        {/* Hero Section */}
        <header className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Scale className="h-3.5 w-3.5" />
            <span>{route.stateName} Cadastral Standard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {route.h1}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {route.description}
          </p>
        </header>

        {/* Interactive Converter Pre-bound to Route Context */}
        <section aria-label="Interactive Land Converter" className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calculator className="h-4 w-4 text-primary" />
            <span>Instant Interactive Calculator</span>
          </div>
          <ConverterInput />
        </section>

        {/* Formula Breakdown Card */}
        <section
          aria-labelledby="formula-heading"
          className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-3"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 id="formula-heading" className="text-base sm:text-lg font-bold text-card-foreground">
              Conversion Formula & Calculation
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Direct Formula
              </span>
              <code className="text-sm sm:text-base font-mono font-bold text-primary block break-words">
                {route.formula}
              </code>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Inverse Formula
              </span>
              <code className="text-sm sm:text-base font-mono font-bold text-foreground/80 block break-words">
                {route.inverseFormula}
              </code>
            </div>
          </div>

          <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
            Standard factor multiplier: <strong>{route.factor}</strong>. Calculations on Bharat Land Converter use exact double-precision arithmetic compliant with state cadastral rules.
          </p>
        </section>

        {/* Quick Conversion Reference Table */}
        <section
          aria-labelledby="table-heading"
          className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 id="table-heading" className="text-base sm:text-lg font-bold text-card-foreground">
              Quick Reference Conversion Table
            </h2>
            <span className="text-xs text-muted-foreground">Standard Values</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Input Value</th>
                  <th className="py-2.5 px-3">Converted Value</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {route.conversionTable.map(([val, res], idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {val}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-primary">
                      {res}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setInputValue(String(val))}
                        className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <span>Calculate</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Regional Definition & Legal Provenance */}
        <section
          aria-labelledby="provenance-heading"
          className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 space-y-3"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 id="provenance-heading" className="text-base sm:text-lg font-bold text-foreground">
              Regional Land Measurement & Legal Provenance
            </h2>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-foreground/80 leading-relaxed">
            <p>
              <strong>Statutory Authority / Reference:</strong> {route.statutoryRef}
            </p>
            <p className="text-muted-foreground">
              {route.customaryNotes}
            </p>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section aria-labelledby="faq-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            <h2 id="faq-heading" className="text-base sm:text-lg font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {route.faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-1.5 shadow-xs"
              >
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Conversions & Internal Links */}
        <section aria-labelledby="related-heading" className="space-y-3">
          <h2 id="related-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Related Indian Land Conversions
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {route.relatedLinks.map((rel, idx) => (
              <Link
                key={idx}
                to={rel.path}
                className="group flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/40 transition-all text-sm font-medium text-foreground"
              >
                <span>{rel.title}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* Back to Homepage / All Units CTA */}
        <div className="pt-2 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs sm:text-sm font-semibold transition-colors"
          >
            <span>Explore All 35+ Units on Bharat Land Converter</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>

      {/* Structured Data Scripts for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Footer />
    </div>
  );
}

export default function ConversionLanding() {
  const location = useLocation();
  const route = getConversionRouteByPath(location.pathname);

  if (!route) {
    return <NotFound />;
  }

  return (
    <AppProvider
      initialRegionCode={route.stateCode}
      initialFromUnitId={route.fromUnit}
      initialToUnitId={route.toUnit}
      initialInputValue={String(route.defaultVal)}
    >
      <ConversionLandingContent route={route} />
    </AppProvider>
  );
}

