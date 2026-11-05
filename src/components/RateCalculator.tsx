import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { calculateLandValuation, getUnit } from "@/core";
import { t } from "@/data/translations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Calculator, ChevronDown, IndianRupee } from "lucide-react";

export default function RateCalculator() {
  const { lang, fromUnit, validation, availableUnits } = useApp();
  const [open, setOpen] = useState(false);
  const [rateStr, setRateStr] = useState("5000");
  const [rateUnitId, setRateUnitId] = useState("sqft");

  const rateUnit = useMemo(() => {
    return getUnit(rateUnitId) || availableUnits[0];
  }, [rateUnitId, availableUnits]);

  const rateNum = parseFloat(rateStr.replace(/,/g, ""));
  const areaValue = validation.isValid ? validation.parsedValue : 0;

  const valuation = useMemo(() => {
    if (!validation.isValid || isNaN(rateNum) || rateNum <= 0) {
      return null;
    }
    return calculateLandValuation(areaValue, fromUnit, rateNum, rateUnit);
  }, [validation, areaValue, fromUnit, rateNum, rateUnit]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between rounded-2xl border-border/70 p-4 h-auto text-sm font-semibold hover:bg-secondary/40 shadow-xs"
        >
          <span className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <IndianRupee className="h-4 w-4" />
            </div>
            <span>{t("rateCalc", lang)}</span>
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 animate-fade-in space-y-4 rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
        <p className="text-xs text-muted-foreground">
          {lang === "hi"
            ? `वर्तमान क्षेत्रफल (${areaValue} ${fromUnit.nameHi}) के आधार पर कुल बाजार मूल्य का मूल्यांकन करें:`
            : `Compute total property valuation based on current area (${areaValue} ${fromUnit.name}):`}
        </p>

        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <div>
            <label htmlFor="land-rate-input" className="mb-1 block text-xs font-semibold text-foreground">
              {t("ratePerUnit", lang)}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
              <Input
                id="land-rate-input"
                type="text"
                inputMode="decimal"
                value={rateStr}
                onChange={(e) => setRateStr(e.target.value)}
                placeholder="5000"
                className="h-11 rounded-xl border-border/70 pl-8 text-base font-bold tabular-nums bg-background"
              />
            </div>
          </div>

          <div>
            <label htmlFor="rate-unit-select" className="mb-1 block text-xs font-semibold text-foreground">
              Per Unit
            </label>
            <Select value={rateUnit.id} onValueChange={setRateUnitId}>
              <SelectTrigger id="rate-unit-select" className="h-11 rounded-xl border-border/70 bg-background text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[260px]">
                {availableUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {lang === "hi" ? u.nameHi : u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {valuation && valuation.totalValue > 0 && (
          <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 via-primary/5 to-transparent border border-emerald-500/20 p-4 text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("totalValue", lang)}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {valuation.formattedCurrency}
            </div>
            <div className="text-xs font-medium text-foreground">
              {lang === "hi" ? valuation.wordsHi : valuation.wordsEn}
            </div>
            <p className="pt-2 text-[11px] text-muted-foreground font-mono">
              {valuation.calculationBreakdown}
            </p>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
