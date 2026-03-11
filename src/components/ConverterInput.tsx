import { useApp } from "@/context/AppContext";
import { UNITS, CATEGORIES, STATE_TO_CATEGORY } from "@/data/units";
import { t } from "@/data/translations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";

export default function ConverterInput() {
  const { lang, inputValue, setInputValue, fromUnitId, setFromUnitId, selectedState, stateCategory } = useApp();

  // Group units by category, prioritizing selected state's category
  const grouped: Record<string, typeof UNITS> = {};
  for (const u of UNITS) {
    if (!grouped[u.category]) grouped[u.category] = [];
    grouped[u.category].push(u);
  }

  // Sort categories: state category first, then Standard, then rest
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    if (a === stateCategory) return -1;
    if (b === stateCategory) return 1;
    if (a === "Standard") return -1;
    if (b === "Standard") return 1;
    return 0;
  });

  return (
    <div className="animate-fade-in rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">
          {lang === "hi" ? "मान दर्ज करें" : "Convert Land Area"}
        </h2>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t("enterValue", lang)}
          </label>
          <Input
            type="number"
            inputMode="decimal"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="1000"
            className="h-12 rounded-lg border-border/60 bg-background text-xl font-bold tabular-nums tracking-tight transition-shadow focus:shadow-md focus:shadow-primary/5 sm:h-14 sm:text-2xl"
            min="0"
            step="any"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t("fromUnit", lang)}
          </label>
          <Select value={fromUnitId} onValueChange={setFromUnitId}>
            <SelectTrigger className="h-12 rounded-lg border-border/60 bg-background text-sm font-medium transition-shadow focus:shadow-md focus:shadow-primary/5 sm:h-14 sm:text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {sortedCategories.map((cat) => (
                <SelectGroup key={cat}>
                  <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-primary/70">{cat}</SelectLabel>
                  {grouped[cat].map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {lang === "hi" ? u.nameHi : u.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
