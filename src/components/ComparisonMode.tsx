import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { BIGHA_COMPARISON, formatIndianNumber } from "@/data/units";
import { t } from "@/data/translations";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { BarChart3, ChevronDown } from "lucide-react";

export default function ComparisonMode() {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);

  const maxSqft = Math.max(...BIGHA_COMPARISON.map((b) => b.sqft));

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between rounded-xl border-border/60 text-sm font-semibold hover:bg-secondary/50">
          <span className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t("compareBigha", lang)}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 animate-fade-in space-y-6 rounded-xl border border-border/50 bg-card p-4">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="pb-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">State</th>
                <th className="pb-2.5 pr-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sq Ft</th>
                <th className="pb-2.5 pr-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acre</th>
                <th className="pb-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Guntha</th>
              </tr>
            </thead>
            <tbody>
              {BIGHA_COMPARISON.map((b) => (
                <tr key={b.id} className="border-b border-border/30">
                  <td className="py-2.5 pr-4 font-medium text-foreground">
                    {lang === "hi" ? b.stateHi : b.state}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-foreground">
                    {formatIndianNumber(b.sqft)}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                    {(b.sqft / 43560).toFixed(4)}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                    {(b.sqft / 1089).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CSS Bar Chart */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Size Comparison
          </div>
          {BIGHA_COMPARISON.map((b) => {
            const pct = (b.sqft / maxSqft) * 100;
            return (
              <div key={b.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {lang === "hi" ? b.stateHi : b.state}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{formatIndianNumber(b.sqft)} sqft</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-secondary/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
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
