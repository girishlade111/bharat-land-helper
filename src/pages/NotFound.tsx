import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Compass } from "lucide-react";

function NotFoundContent() {
  const location = useLocation();

  useEffect(() => {
    // Log invalid route for client tracking
    if (typeof console !== "undefined") {
      console.warn("404 Not Found:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background">
      <Header />

      <main className="container max-w-2xl px-4 py-12 text-center flex-1 flex flex-col justify-center items-center">
        <div className="text-7xl sm:text-8xl font-black text-primary/20 tracking-tighter">
          404
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md">
          The requested page <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">{location.pathname}</code> does not exist on Bharat Land Converter.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Main Converter</span>
          </Link>
        </div>

        {/* Popular Conversion Links */}
        <div className="mt-10 w-full rounded-2xl border border-border bg-card p-5 text-left space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Compass className="h-4 w-4 text-primary" />
            <span>Popular Land Area Converters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <Link
              to="/convert/acre-to-sqft"
              className="p-2 rounded-lg hover:bg-muted text-foreground font-medium flex items-center justify-between"
            >
              <span>Acre to Square Feet</span>
              <span className="text-xs text-muted-foreground">43,560 sq ft</span>
            </Link>
            <Link
              to="/convert/acre-to-guntha/maharashtra"
              className="p-2 rounded-lg hover:bg-muted text-foreground font-medium flex items-center justify-between"
            >
              <span>Acre to Guntha (MH)</span>
              <span className="text-xs text-muted-foreground">40 Guntha</span>
            </Link>
            <Link
              to="/convert/hectare-to-acre"
              className="p-2 rounded-lg hover:bg-muted text-foreground font-medium flex items-center justify-between"
            >
              <span>Hectare to Acre</span>
              <span className="text-xs text-muted-foreground">2.471 Acre</span>
            </Link>
            <Link
              to="/convert/acre-to-bigha/uttar-pradesh"
              className="p-2 rounded-lg hover:bg-muted text-foreground font-medium flex items-center justify-between"
            >
              <span>Acre to Bigha (UP)</span>
              <span className="text-xs text-muted-foreground">1.60 Bigha</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function NotFound() {
  return (
    <AppProvider>
      <NotFoundContent />
    </AppProvider>
  );
}

