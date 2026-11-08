import { useApp } from "@/context/AppContext";
import { t } from "@/data/translations";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Copy, ShieldCheck, Check } from "lucide-react";
import { useState } from "react";

export default function ResultsGrid() {
  const {
    lang,
    oneToAllResult,
    toUnit,
    setToUnitId,
    activeTab,
    selectedRegion,
  } = useApp();

  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter items by category tab
  const items = oneToAllResult.results.filter((item) => {
    if (activeTab === "Standard") return item.unit.category === "standard";
    if (activeTab === "Regional") return item.unit.category === "regional";
    return true; // "All"
  });

  const handleCardClick = (unitId: string, formattedVal: string, unitName: string) => {
    setToUnitId(unitId);
    const textToCopy = `${formattedVal} ${unitName}`;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedId(unitId);
        toast({
          title: t("copied", lang),
          description: textToCopy,
        });
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => {
        // Ignore clipboard permission issues
      });
    }
  };

  return (
    <section aria-labelledby="all-results-heading" className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 id="all-results-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("allUnits", lang)} ({items.length})
        </h3>
        <span className="text-[11px] text-muted-foreground">
          {lang === "hi" ? "क्लिक करें: लक्ष्य इकाई सेट करें" : "Click to select target unit"}
        </span>
      </div>

      <div
        role="region"
        aria-live="polite"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4"
      >
        {items.map((item) => {
          const isSelected = item.unit.id === toUnit.id;
          const isFrom = item.isSameUnit;
          const unitDisplayName = lang === "hi" ? item.unit.nameHi : item.unit.name;
          const isCopied = copiedId === item.unit.id;

          return (
            <button
              key={item.unit.id}
              type="button"
              onClick={() => handleCardClick(item.unit.id, item.formattedResult, unitDisplayName)}
              aria-label={`${unitDisplayName}: ${item.formattedResult}. Click to set as target unit`}
              className={cn(
                "group relative rounded-xl border p-3 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                "min-h-[72px] active:scale-[0.98]",
                isSelected
                  ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                  : isFrom
                  ? "border-border/70 bg-secondary/40"
                  : "border-border/60 bg-card hover:border-primary/40 hover:bg-secondary/20 hover:shadow-xs",
              )}
            >
              {/* Unit Title and Actions */}
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs font-semibold text-foreground leading-snug line-clamp-1">
                  {unitDisplayName}
                </span>
                {isCopied ? (
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground/40 transition-colors group-hover:text-primary shrink-0" />
                )}
              </div>

              {/* Formatted Number Display */}
              <div
                className={cn(
                  "mt-1.5 text-base sm:text-lg font-bold tabular-nums tracking-tight leading-tight",
                  isSelected ? "text-primary" : "text-foreground",
                )}
              >
                {item.formattedResult}
              </div>

              {/* Unit Metadata / Provenance Note */}
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="truncate max-w-[120px]">
                  {item.unit.category === "regional" ? item.unit.regionName || selectedRegion.name : "Standard"}
                </span>
                {item.unit.provenance.confidence === "OFFICIAL_STANDARD" && (
                  <span title="Official Standard">
                    <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" aria-label="Official Standard" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
