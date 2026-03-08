import { useApp } from "@/context/AppContext";
import { UNITS, convert, formatIndianNumber } from "@/data/units";
import { t } from "@/data/translations";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {filtered.map((unit) => {
        const result = isValid ? convert(numValue, fromUnit!.sqft, unit.sqft) : 0;
        const display = isValid ? formatIndianNumber(result) : t("noValue", lang);
        const isFrom = unit.id === fromUnitId;

        return (
          <button
            key={unit.id}
            onClick={() => isValid && handleCopy(result.toString(), lang === "hi" ? unit.nameHi : unit.name)}
            className={cn(
              "group rounded-lg border p-3 text-left transition-all hover:shadow-md",
              "min-h-[44px] active:scale-[0.98]",
              isFrom
                ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <div className="text-xs font-medium text-muted-foreground group-hover:text-primary">
              {lang === "hi" ? unit.nameHi : unit.name}
            </div>
            <div className={cn(
              "mt-1 text-base font-bold leading-tight sm:text-lg",
              isFrom ? "text-primary" : "text-foreground"
            )}>
              {display}
            </div>
            {unit.note && (
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {lang === "hi" && unit.noteHi ? unit.noteHi : unit.note}
              </div>
            )}
            {!isFrom && isValid && (
              <div className="mt-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                📋 {lang === "hi" ? "कॉपी करें" : "Click to copy"}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
