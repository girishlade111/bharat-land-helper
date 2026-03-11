import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { UNITS, formatIndianCurrency } from "@/data/units";
import { t } from "@/data/translations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Calculator, ChevronDown } from "lucide-react";

const RATE_UNITS = ["sqft", "sqm", "acre", "guntha_mh", "bigha_up"];

export default function RateCalculator() {
  const { lang, inputValue, fromUnitId } = useApp();
  const [open, setOpen] = useState(false);
  const [rate, setRate] = useState("");
  const [rateUnitId, setRateUnitId] = useState("sqft");

  const numValue = parseFloat(inputValue);
  const fromUnit = UNITS.find((u) => u.id === fromUnitId);
  const rateUnit = UNITS.find((u) => u.id === rateUnitId);
  const rateNum = parseFloat(rate);

  let totalValue = 0;
  if (fromUnit && rateUnit && !isNaN(numValue) && numValue > 0 && !isNaN(rateNum) && rateNum > 0) {
    const totalSqft = numValue * fromUnit.sqft;
    const rateUnitCount = totalSqft / rateUnit.sqft;
    totalValue = rateUnitCount * rateNum;
  }

  const { formatted, words } = formatIndianCurrency(totalValue);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between rounded-xl border-border/60 text-sm font-semibold hover:bg-secondary/50">
          <span className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            {t("rateCalc", lang)}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 animate-fade-in space-y-3 rounded-xl border border-border/50 bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("ratePerUnit", lang)}</label>
            <Input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="5000"
              className="h-11 rounded-lg border-border/60 text-base tabular-nums"
              min="0"
              step="any"
            />
          </div>
          <div className="w-full sm:w-[160px]">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Per</label>
            <Select value={rateUnitId} onValueChange={setRateUnitId}>
              <SelectTrigger className="h-11 rounded-lg border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RATE_UNITS.map((id) => {
                  const u = UNITS.find((x) => x.id === id);
                  return u ? (
                    <SelectItem key={id} value={id}>
                      {lang === "hi" ? u.nameHi : u.name}
                    </SelectItem>
                  ) : null;
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        {totalValue > 0 && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-center">
            <div className="text-xs font-medium text-muted-foreground">{t("totalValue", lang)}</div>
            <div className="mt-1 text-2xl font-bold text-primary tabular-nums">{formatted}</div>
            <div className="mt-0.5 text-xs font-medium text-muted-foreground">{words}</div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
