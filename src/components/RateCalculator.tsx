import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { calculateLandValuation, getUnit, parseStrictRate, loadCustomPresets } from "@/core";
import { t } from "@/data/translations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, IndianRupee, AlertCircle } from "lucide-react";

export default function RateCalculator() {
  const { lang, fromUnit, validation, availableUnits } = useApp();
  const [open, setOpen] = useState(false);
  const [rateStr, setRateStr] = useState("5000");
  const [rateUnitId, setRateUnitId] = useState("sqft");
  const [customVersion, setCustomVersion] = useState(0);

  // Synchronize with custom unit updates in current or other browser tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "bharat_custom_units_v1") {
        setCustomVersion((v) => v + 1);
      }
    };
    const handleCustomChange = () => setCustomVersion((v) => v + 1);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("bharat_custom_units_updated", handleCustomChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("bharat_custom_units_updated", handleCustomChange);
    };
  }, []);

  const isCustomUnit = rateUnitId.startsWith("custom_") || rateUnitId.startsWith("custom-");

  const resolvedUnit = useMemo(() => {
    return getUnit(rateUnitId);
  }, [rateUnitId, customVersion, availableUnits]);

  // A unit is unavailable if:
  // 1. No unit resolved by ID, or unit has non-positive sqFt
  // 2. If it is a custom unit, it must be present in availableUnits or active custom presets
  const isUnitUnavailable = useMemo(() => {
    if (!rateUnitId) return true;
    if (!resolvedUnit || !Number.isFinite(resolvedUnit.sqFt) || resolvedUnit.sqFt <= 0) {
      return true;
    }
    if (isCustomUnit) {
      const inAvailable = availableUnits.some((u) => u.id === rateUnitId);
      if (!inAvailable) {
        const presets = loadCustomPresets();
        const cleanId = rateUnitId.replace(/^custom_/, "");
        const inPresets = presets.some((p) => p.id === rateUnitId || p.id === cleanId || `custom_${p.id}` === rateUnitId);
        if (!inPresets) return true;
      }
    }
    return false;
  }, [rateUnitId, resolvedUnit, isCustomUnit, availableUnits, customVersion]);

  // Never silently fall back to another unit if selected unit disappeared!
  const rateUnit = isUnitUnavailable ? null : resolvedUnit;

  // Preserve valid regional or non-standard rate unit selections across region switches
  const selectableUnits = useMemo(() => {
    if (rateUnit && !availableUnits.some((u) => u.id === rateUnit.id)) {
      return [rateUnit, ...availableUnits];
    }
    return availableUnits;
  }, [rateUnit, availableUnits]);

  const parsedRate = useMemo(() => {
    return parseStrictRate(rateStr);
  }, [rateStr]);

  const isRateInvalid = !parsedRate.isValid && !parsedRate.isEmpty;
  const rateNum = parsedRate.isValid ? parsedRate.value : 0;
  const areaValue = validation.isValid ? validation.parsedValue : 0;

  const valuation = useMemo(() => {
    if (!validation.isValid || !parsedRate.isValid || rateNum <= 0 || !rateUnit) {
      return null;
    }
    return calculateLandValuation(areaValue, fromUnit, rateNum, rateUnit);
  }, [validation, areaValue, fromUnit, parsedRate.isValid, rateNum, rateUnit]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          id="rate-calculator-toggle"
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
            : lang === "mr"
            ? `सध्याच्या क्षेत्रफळावर (${areaValue} ${fromUnit.nameMr || fromUnit.nameHi || fromUnit.name}) आधारित एकूण बाजार मूल्याचे मूल्यांकन करा:`
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
                aria-invalid={isRateInvalid}
                aria-describedby={isRateInvalid ? "rate-input-error" : undefined}
                className={`h-11 rounded-xl border-border/70 pl-8 text-base font-bold tabular-nums bg-background transition-colors ${
                  isRateInvalid ? "border-destructive text-destructive focus-visible:ring-destructive" : ""
                }`}
              />
            </div>
            {isRateInvalid && (
              <p
                id="rate-input-error"
                role="alert"
                className="mt-1 text-xs font-medium text-destructive flex items-center gap-1"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {lang === "hi"
                    ? parsedRate.errorHi || "कृपया एक मान्य संख्यात्मक दर दर्ज करें।"
                    : parsedRate.error || "Please enter a valid numeric rate."}
                </span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="rate-unit-select" className="mb-1 block text-xs font-semibold text-foreground">
              Per Unit
            </label>
            <Select value={rateUnit ? rateUnit.id : ""} onValueChange={setRateUnitId}>
              <SelectTrigger
                id="rate-unit-select"
                aria-invalid={isUnitUnavailable}
                aria-describedby={isUnitUnavailable ? "rate-unit-error" : undefined}
                className={`h-11 rounded-xl border-border/70 bg-background text-xs font-medium ${
                  isUnitUnavailable ? "border-destructive text-destructive" : ""
                }`}
              >
                <SelectValue placeholder={lang === "hi" ? "यूनिट चुनें" : lang === "mr" ? "एकक निवडा" : "Select a unit"} />
              </SelectTrigger>
              <SelectContent className="max-h-[260px]">
                {selectableUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {lang === "hi" ? u.nameHi : lang === "mr" ? (u.nameMr || u.nameHi || u.name) : u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isUnitUnavailable && (
              <p
                id="rate-unit-error"
                role="alert"
                className="mt-1 text-xs font-medium text-destructive flex items-center gap-1"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {lang === "hi"
                    ? "चयनित दर यूनिट अब उपलब्ध नहीं है। कृपया एक मान्य यूनिट चुनें।"
                    : lang === "mr"
                    ? "निवडलेले दर एकक आता उपलब्ध नाही. कृपया वैध एकक निवडा."
                    : "The selected rate unit is no longer available. Please select a valid unit."}
                </span>
              </p>
            )}
          </div>
        </div>

        {valuation && valuation.totalValue > 0 && (
          <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 via-primary/5 to-transparent border border-emerald-500/20 p-4 text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("totalValue", lang)}
            </span>
            <div id="rate-total-value" className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {valuation.formattedCurrency}
            </div>
            <div id="rate-words-display" className="text-xs font-medium text-foreground">
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
