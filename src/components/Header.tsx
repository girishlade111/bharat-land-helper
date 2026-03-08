import { useApp } from "@/context/AppContext";
import { STATES } from "@/data/units";
import { t } from "@/data/translations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { lang, setLang, selectedState, setSelectedState } = useApp();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🇮🇳</span>
          <h1 className="text-lg font-bold text-primary sm:text-xl">
            {t("appTitle", lang)}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="h-9 w-[140px] text-xs sm:w-[180px] sm:text-sm">
              <SelectValue placeholder={t("selectState", lang)} />
            </SelectTrigger>
            <SelectContent>
              {STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="min-w-[70px] text-xs font-semibold"
          >
            {t("language", lang)}
          </Button>
        </div>
      </div>
    </header>
  );
}
