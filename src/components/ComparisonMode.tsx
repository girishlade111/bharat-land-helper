import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { BIGHA_COMPARISON, formatIndianNumber } from "@/data/units";
import { t } from "@/data/translations";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export default function ComparisonMode() {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);

  const maxSqft = Math.max(...BIGHA_COMPARISON.map((b) => b.sqft));

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between text-base font-semibold">
          {t("compareBigha", lang)}
          <span className="text-lg">{open ? "▲" : "▼"}</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-2 rounded-lg border bg-card p-4">
        {BIGHA_COMPARISON.map((b) => {
          const pct = (b.sqft / maxSqft) * 100;
          return (
            <div key={b.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {lang === "hi" ? `बीघा (${b.stateHi})` : `Bigha (${b.state})`}
                </span>
                <span className="text-muted-foreground">{formatIndianNumber(b.sqft)} sqft</span>
              </div>
              <div className="h-5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
