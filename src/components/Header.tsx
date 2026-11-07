import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { buildConversionSearchParams } from "@/core";
import { t, type Lang } from "@/data/translations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Moon, Sun, Wrench } from "lucide-react";

export function resolveLocalizedDestination(currentPathname: string, targetLang: Lang): {
  targetPath: string;
  hasDedicatedPage: boolean;
} {
  // Strip existing locale prefix to get the canonical English path
  let canonicalPath = currentPathname;
  if (canonicalPath.startsWith("/hi")) {
    canonicalPath = canonicalPath.replace(/^\/hi(\/|$)/, "/") || "/";
  } else if (canonicalPath.startsWith("/mr")) {
    canonicalPath = canonicalPath.replace(/^\/mr(\/|$)/, "/") || "/";
  }

  // Canonical paths with dedicated localized static routes in Hindi and Marathi
  const LOCALIZED_CANONICAL_PATHS = new Set([
    "/",
    "/tools",
    "/tools/plot-area-calculator",
    "/tools/compound-land-unit-converter",
    "/tools/land-unit-comparison",
    "/tools/custom-land-unit-calculator",
  ]);

  if (LOCALIZED_CANONICAL_PATHS.has(canonicalPath)) {
    if (targetLang === "hi") {
      return {
        targetPath: canonicalPath === "/" ? "/hi" : `/hi${canonicalPath}`,
        hasDedicatedPage: true,
      };
    }
    if (targetLang === "mr") {
      return {
        targetPath: canonicalPath === "/" ? "/mr" : `/mr${canonicalPath}`,
        hasDedicatedPage: true,
      };
    }
    return {
      targetPath: canonicalPath,
      hasDedicatedPage: true,
    };
  }

  // Route does NOT have a dedicated localized page (e.g., /convert/*, /about, /faq, /privacy, /terms).
  // Stay on current path to avoid generating 404 routes.
  return {
    targetPath: canonicalPath,
    hasDedicatedPage: false,
  };
}

export default function Header() {
  const {
    lang,
    setLang,
    selectedRegion,
    setSelectedRegionCode,
    availableRegions,
    inputValue,
    fromUnit,
    toUnit,
  } = useApp();
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const storedTheme = typeof window !== "undefined" ? window.localStorage?.getItem("bharat_theme") : null;
      const prefersDark =
        typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldDark = storedTheme === "dark" || (!storedTheme && prefersDark);
      setIsDark(shouldDark);
      if (typeof document !== "undefined") {
        if (shouldDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } catch {
      // Storage restricted
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof document !== "undefined") {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        try {
          window.localStorage?.setItem("bharat_theme", "dark");
        } catch (_err) {
          // ignore localStorage access errors
        }
      } else {
        document.documentElement.classList.remove("dark");
        try {
          window.localStorage?.setItem("bharat_theme", "light");
        } catch (_err) {
          // ignore localStorage access errors
        }
      }
    }
  };

  const handleLangChange = (nextLang: Lang) => {
    setLang(nextLang);
    const pathname = location.pathname;
    const { targetPath, hasDedicatedPage } = resolveLocalizedDestination(pathname, nextLang);

    const isCustomFrom = fromUnit?.regionCode === "CUSTOM" || Boolean(fromUnit?.id.startsWith("custom"));
    const isCustomTo = toUnit?.regionCode === "CUSTOM" || Boolean(toUnit?.id.startsWith("custom"));

    // Build query string using the live, committed conversion state rather than stale location.search
    const destinationSearch = buildConversionSearchParams(
      {
        value: inputValue,
        fromUnitId: fromUnit?.id,
        toUnitId: toUnit?.id,
        regionCode: selectedRegion?.code,
        fromSqFt: isCustomFrom ? fromUnit?.sqFt : undefined,
        fromName: isCustomFrom ? fromUnit?.name?.replace(/\s*\(Custom.*?\)/, "").trim() : undefined,
        toSqFt: isCustomTo ? toUnit?.sqFt : undefined,
        toName: isCustomTo ? toUnit?.name?.replace(/\s*\(Custom.*?\)/, "").trim() : undefined,
      },
      typeof window !== "undefined" ? window.location.search : location.search,
      {
        defaultValue: "1",
        defaultFromUnitId: "acre",
        defaultRegionCode: "MH",
      }
    );

    if (hasDedicatedPage && targetPath !== pathname) {
      navigate({
        pathname: targetPath,
        search: destinationSearch,
      });
    }
  };

  const cycleLang = () => {
    const nextLang: Lang = lang === "en" ? "hi" : lang === "hi" ? "mr" : "en";
    handleLangChange(nextLang);
  };

  const homePath = lang === "hi" ? "/hi" : lang === "mr" ? "/mr" : "/";
  const toolsPath = lang === "hi" ? "/hi/tools" : lang === "mr" ? "/mr/tools" : "/tools";

  const states = availableRegions.filter((r) => r.type === "state");
  const unionTerritories = availableRegions.filter((r) => r.type === "ut");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/90 backdrop-blur-md">
      <div className="container max-w-5xl flex h-14 items-center justify-between gap-3 px-4 sm:h-16">
        {/* Brand / Logo */}
        <Link to={homePath} className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 text-white text-base font-black shadow-sm">
            B
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground sm:text-base leading-tight">
              {t("appTitle", lang)}
            </span>
            <span className="hidden text-[10px] font-medium text-muted-foreground sm:block leading-tight">
              {t("tagline", lang)}
            </span>
          </div>
        </Link>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Tools Hub Nav Link */}
          <Link
            to={toolsPath}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 rounded-xl border border-border/70 bg-secondary/40 px-2.5 text-xs font-semibold hover:bg-secondary text-foreground transition-colors"
            title="Land Measurement Tools Hub"
          >
            <Wrench className="h-3.5 w-3.5 text-primary" />
            <span>{t("navTools", lang)}</span>
          </Link>

          {/* State / Region Selector */}
          <Select value={selectedRegion.code} onValueChange={setSelectedRegionCode}>
            <SelectTrigger
              id="state-selector-trigger"
              className="h-9 w-[130px] rounded-xl border-border/70 bg-secondary/50 text-xs font-semibold sm:w-[180px] sm:text-sm"
              aria-label={t("selectState", lang)}
            >
              <MapPin className="mr-1.5 h-3.5 w-3.5 text-primary shrink-0" />
              <SelectValue placeholder={lang === "hi" ? selectedRegion.nameHi : selectedRegion.name} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectGroup>
                <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  States (28)
                </SelectLabel>
                {states.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {lang === "hi" ? s.nameHi : s.name}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Union Territories (8)
                </SelectLabel>
                {unionTerritories.map((ut) => (
                  <SelectItem key={ut.code} value={ut.code}>
                    {lang === "hi" ? ut.nameHi : ut.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Language Switcher Button (accessible cycle & testable) */}
          <Button
            id="lang-toggle-btn"
            type="button"
            variant="outline"
            size="sm"
            onClick={cycleLang}
            className="h-9 gap-1.5 rounded-xl border-border/70 bg-secondary/50 px-2.5 text-xs font-semibold hover:bg-secondary sm:px-3"
            aria-label={`Current language: ${lang}. Switch language: English, Hindi, Marathi`}
            title="Switch Language: English / हिंदी / मराठी"
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>{lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "मराठी"}</span>
          </Button>

          {/* Theme Switcher */}
          <Button
            id="theme-toggle-btn"
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl border-border/70 bg-secondary/50 hover:bg-secondary text-foreground shrink-0"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
