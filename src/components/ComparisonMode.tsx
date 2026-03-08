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
      <CollapsibleContent className="mt-3 space-y-6 rounded-lg border bg-card p-4">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 pr-4 font-semibold text-muted-foreground">State</th>
                <th className="pb-2 pr-4 text-right font-semibold text-muted-foreground">Sq Ft</th>
                <th className="pb-2 pr-4 text-right font-semibold text-muted-foreground">Acre</th>
                <th className="pb-2 text-right font-semibold text-muted-foreground">Guntha</th>
              </tr>
            </thead>
            <tbody>
              {BIGHA_COMPARISON.map((b) => (
                <tr key={b.id} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">
                    {lang === "hi" ? b.stateHi : b.state}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {formatIndianNumber(b.sqft)}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {(b.sqft / 43560).toFixed(4)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {(b.sqft / 1089).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CSS Bar Chart */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Size Comparison
          </div>
          {BIGHA_COMPARISON.map((b) => {
            const pct = (b.sqft / maxSqft) * 100;
            return (
              <div key={b.id} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">
                    {lang === "hi" ? b.stateHi : b.state}
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
