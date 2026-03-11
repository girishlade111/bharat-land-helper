import { useApp } from "@/context/AppContext";
import { UNITS, convert, formatIndianNumber } from "@/data/units";
import { t } from "@/data/translations";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";

export default function ResultsGrid() {
  const { lang, inputValue, fromUnitId, activeTab, stateCategory } = useApp();
  const { toast } = useToast();

  const numValue = parseFloat(inputValue);
  const fromUnit = UNITS.find((u) => u.id === fromUnitId);
  const isValid = !isNaN(numValue) && numValue > 0 && fromUnit;

  // Filter units by active tab
  let filtered = UNITS;
  if (activeTab !== "All") {
    filtered = UNITS.filter((u) => u.category === activeTab);
  }

  // Sort: state category units first
  filtered = [...filtered].sort((a, b) => {
    if (a.category === stateCategory && b.category !== stateCategory) return -1;
    if (b.category === stateCategory && a.category !== stateCategory) return 1;
    return 0;
  });

  const handleCopy = (value: string, name: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: t("copied", lang), description: `${name}: ${value}` });
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {filtered.map((unit) => {
        const result = isValid ? convert(numValue, fromUnit!.sqft, unit.sqft) : 0;
        const display = isValid ? formatIndianNumber(result) : t("noValue", lang);
        const isFrom = unit.id === fromUnitId;

        return (
          <button
            key={unit.id}
            onClick={() => isValid && handleCopy(result.toString(), lang === "hi" ? unit.nameHi : unit.name)}
            className={cn(
              "group relative rounded-xl border p-3 text-left transition-all duration-200",
              "min-h-[44px] active:scale-[0.97]",
              isFrom
                ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                : "border-border/50 bg-card hover:border-primary/30 hover:shadow-sm"
            )}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="text-[11px] font-medium text-muted-foreground leading-tight">
                {lang === "hi" ? unit.nameHi : unit.name}
              </span>
              {!isFrom && isValid && (
                <Copy className="h-3 w-3 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/60" />
              )}
            </div>
            <div className={cn(
              "mt-1.5 text-base font-bold leading-tight tabular-nums tracking-tight sm:text-lg",
              isFrom ? "text-primary" : "text-foreground"
            )}>
              {display}
            </div>
            {unit.note && (
              <div className="mt-1 text-[10px] leading-tight text-muted-foreground/70">
                {lang === "hi" && unit.noteHi ? unit.noteHi : unit.note}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
