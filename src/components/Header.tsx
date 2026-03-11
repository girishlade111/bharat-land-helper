import { useApp } from "@/context/AppContext";
import { STATES } from "@/data/units";
import { t } from "@/data/translations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe, MapPin } from "lucide-react";

export default function Header() {
  const { lang, setLang, selectedState, setSelectedState } = useApp();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 glass">
      <div className="container flex h-14 items-center justify-between gap-3 px-4 sm:h-16">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg hero-gradient text-white text-sm font-bold shadow-sm">
            B
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-base leading-tight">
              {t("appTitle", lang)}
            </h1>
            <span className="hidden text-[10px] text-muted-foreground sm:block leading-tight">
              {lang === "hi" ? "भूमि माप कन्वर्टर" : "Land Measurement Converter"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="h-8 w-[120px] rounded-lg border-border/60 bg-secondary/50 text-xs font-medium sm:h-9 sm:w-[160px] sm:text-sm">
              <MapPin className="mr-1.5 h-3 w-3 text-primary shrink-0" />
              <SelectValue placeholder={t("selectState", lang)} />
            </SelectTrigger>
            <SelectContent>
              {STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="h-8 gap-1.5 rounded-lg border border-border/60 bg-secondary/50 px-2.5 text-xs font-semibold hover:bg-secondary sm:h-9 sm:px-3"
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
            {t("language", lang)}
          </Button>
        </div>
      </div>
    </header>
  );
}
