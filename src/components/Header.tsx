import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/data/translations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Moon, Sun } from "lucide-react";

export default function Header() {
  const { lang, setLang, selectedRegion, setSelectedRegionCode, availableRegions } = useApp();
  const [isDark, setIsDark] = useState(false);

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

  const states = availableRegions.filter((r) => r.type === "state");
  const unionTerritories = availableRegions.filter((r) => r.type === "ut");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/90 backdrop-blur-md">
      <div className="container max-w-5xl flex h-14 items-center justify-between gap-3 px-4 sm:h-16">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 text-white text-base font-black shadow-sm">
            B
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground sm:text-base leading-tight">
              {t("appTitle", lang)}
            </span>
            <span className="hidden text-[10px] font-medium text-muted-foreground sm:block leading-tight">
              {lang === "hi"
                ? "28 राज्य और 8 केंद्र शासित प्रदेशों का सत्यापित भूमि मापक"
                : "Source-backed land measurement for all 28 States & 8 UTs"}
            </span>
          </div>
        </div>

        {/* Region, Language & Theme Controls */}
        <div className="flex items-center gap-2">
          {/* State / UT Selector */}
          <Select value={selectedRegion.code} onValueChange={setSelectedRegionCode}>
            <SelectTrigger
              id="state-selector-trigger"
              aria-label={t("selectState", lang)}
              className="h-9 w-[130px] rounded-xl border-border/70 bg-secondary/50 text-xs font-semibold sm:w-[180px] sm:text-sm"
            >
              <MapPin className="mr-1.5 h-3.5 w-3.5 text-primary shrink-0" />
              <SelectValue placeholder={t("selectState", lang)} />
            </SelectTrigger>
            <SelectContent className="max-h-[320px]">
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

          {/* Language Switcher */}
          <Button
            id="lang-toggle-btn"
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="h-9 gap-1.5 rounded-xl border-border/70 bg-secondary/50 px-2.5 text-xs font-semibold hover:bg-secondary sm:px-3"
            aria-label={`Switch language to ${lang === "en" ? "Hindi" : "English"}`}
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>{t("language", lang)}</span>
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
