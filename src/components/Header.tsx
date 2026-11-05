import { useApp } from "@/context/AppContext";
import { t } from "@/data/translations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe, MapPin } from "lucide-react";

export default function Header() {
  const { lang, setLang, selectedRegion, setSelectedRegionCode, availableRegions } = useApp();

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
            <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-base leading-tight">
              {t("appTitle", lang)}
            </h1>
            <span className="hidden text-[10px] font-medium text-muted-foreground sm:block leading-tight">
              {lang === "hi"
                ? "28 राज्य और 8 केंद्र शासित प्रदेशों का सत्यापित भूमि मापक"
                : "Source-backed land measurement for all 28 States & 8 UTs"}
            </span>
          </div>
        </div>

        {/* Region & Language Controls */}
        <div className="flex items-center gap-2">
          {/* State / UT Selector */}
          <Select value={selectedRegion.code} onValueChange={setSelectedRegionCode}>
            <SelectTrigger
              aria-label={t("selectState", lang)}
              className="h-9 w-[140px] rounded-xl border-border/70 bg-secondary/50 text-xs font-semibold sm:w-[190px] sm:text-sm"
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
        </div>
      </div>
    </header>
  );
}
