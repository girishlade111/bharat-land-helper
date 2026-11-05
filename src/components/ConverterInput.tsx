import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/data/translations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowRightLeft, Copy, Check, Info, AlertTriangle, ShieldCheck } from "lucide-react";

export default function ConverterInput() {
  const {
    lang,
    inputValue,
    setInputValue,
    fromUnit,
    toUnit,
    setFromUnitId,
    setToUnitId,
    swapUnits,
    availableUnits,
    validation,
    primaryResult,
    displayPrecision,
    setDisplayPrecision,
    selectedRegion,
  } = useApp();

  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Group units into Standard and Regional for clean dropdown UX
  const standardUnits = availableUnits.filter((u) => u.category === "standard");
  const regionalUnits = availableUnits.filter((u) => u.category === "regional");

  const handleCopy = () => {
    if (!primaryResult) return;
    const textToCopy = `${primaryResult.formattedResult} ${lang === "hi" ? toUnit.nameHi : toUnit.name}`;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        toast({
          title: t("copied", lang),
          description: textToCopy,
        });
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        toast({
          title: "Could not copy",
          description: "Clipboard access was denied by your browser.",
        });
      });
    }
  };

  return (
    <section aria-labelledby="converter-heading" className="animate-fade-in rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6 space-y-5">
      {/* Header & Mode Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ArrowRightLeft className="h-4 w-4" />
          </div>
          <div>
            <h2 id="converter-heading" className="text-base font-bold text-foreground leading-tight">
              {lang === "hi" ? "भूमि क्षेत्रफल रूपांतरण" : "Indian Land Area Converter"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {lang === "hi"
                ? `${selectedRegion.nameHi} के लिए सत्यापित इकाइयाँ`
                : `Verified units for ${selectedRegion.name}`}
            </p>
          </div>
        </div>

        {/* Display Precision Selector */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="text-[11px] font-medium">{t("precision", lang)}:</span>
          {[2, 4, 6].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setDisplayPrecision(p)}
              className={`h-7 px-2 rounded-md font-semibold text-xs transition-colors ${
                displayPrecision === p
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary/70 hover:bg-secondary text-foreground"
              }`}
              aria-label={`${p} decimal places`}
            >
              .{p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversion Grid: Input + From Unit + Swap + To Unit */}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        {/* Value Input + From Unit Selector */}
        <div className="space-y-1.5">
          <label htmlFor="area-input" className="block text-xs font-semibold text-foreground">
            {t("enterValue", lang)} &amp; {t("fromUnit", lang)}
          </label>
          <div className="flex gap-2">
            <Input
              id="area-input"
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. 1.5"
              className={`h-12 flex-1 rounded-xl bg-background text-lg font-bold tabular-nums sm:h-14 sm:text-xl ${
                !validation.isValid ? "border-destructive focus-visible:ring-destructive" : "border-border/70"
              }`}
              aria-invalid={!validation.isValid}
              aria-describedby={!validation.isValid ? "input-error-msg" : undefined}
            />
            <div className="w-[140px] sm:w-[170px]">
              <Select value={fromUnit.id} onValueChange={setFromUnitId}>
                <SelectTrigger id="from-unit-select" aria-label={t("fromUnit", lang)} className="h-12 rounded-xl border-border/70 bg-background text-xs sm:h-14 sm:text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {regionalUnits.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {selectedRegion.name} Units
                      </SelectLabel>
                      {regionalUnits.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {lang === "hi" ? u.nameHi : u.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  <SelectGroup>
                    <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Standard &amp; Metric
                    </SelectLabel>
                    {standardUnits.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {lang === "hi" ? u.nameHi : u.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Swap Units Button */}
        <div className="flex justify-center pb-0.5 sm:pb-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={swapUnits}
            className="h-11 w-11 rounded-xl border-border/70 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all active:scale-95 shadow-xs"
            title={t("swapUnits", lang)}
            aria-label={t("swapUnits", lang)}
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* To Unit Selector */}
        <div className="space-y-1.5">
          <label htmlFor="to-unit-select" className="block text-xs font-semibold text-foreground">
            {t("toUnit", lang)}
          </label>
          <Select value={toUnit.id} onValueChange={setToUnitId}>
            <SelectTrigger id="to-unit-select" aria-label={t("toUnit", lang)} className="h-12 w-full rounded-xl border-border/70 bg-background text-xs sm:h-14 sm:text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {regionalUnits.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {selectedRegion.name} Units
                  </SelectLabel>
                  {regionalUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {lang === "hi" ? u.nameHi : u.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              <SelectGroup>
                <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Standard &amp; Metric
                </SelectLabel>
                {standardUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {lang === "hi" ? u.nameHi : u.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Validation Error Message */}
      {!validation.isValid && (
        <div id="input-error-msg" role="alert" className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{lang === "hi" ? validation.errorMessageHi : validation.errorMessage}</span>
        </div>
      )}

      {/* Primary Result Showcase Card */}
      {primaryResult && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {lang === "hi" ? "रूपांतरित मान" : "Converted Value"}
              </span>
              <div className="flex items-baseline gap-2 flex-wrap" aria-live="polite" aria-atomic="true">
                <span data-testid="primary-result-value" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tabular-nums tracking-tight">
                  {primaryResult.formattedResult}
                </span>
                <span data-testid="primary-unit-label" className="text-base sm:text-lg font-semibold text-primary">
                  {lang === "hi" ? toUnit.nameHi : toUnit.name}
                </span>
              </div>
            </div>

            {/* Copy Button */}
            <Button
              type="button"
              variant={copied ? "default" : "outline"}
              onClick={handleCopy}
              className="h-10 gap-2 rounded-xl border-primary/30 text-xs font-semibold sm:self-center"
              aria-label="Copy conversion result to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  <span>{t("copied", lang)}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{lang === "hi" ? "मान कॉपी करें" : "Copy Result"}</span>
                </>
              )}
            </Button>
          </div>

          {/* Formula & Step Breakdown */}
          <div className="mt-4 pt-3 border-t border-border/40 grid gap-2 sm:grid-cols-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-semibold text-foreground">{t("formula", lang)}:</span>
              <span className="font-mono bg-secondary/50 px-2 py-0.5 rounded text-[11px] text-foreground">
                {primaryResult.formula}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-semibold text-foreground">{t("breakdown", lang)}:</span>
              <span className="font-mono bg-secondary/50 px-2 py-0.5 rounded text-[11px] text-foreground truncate">
                {primaryResult.stepCalculation}
              </span>
            </div>
          </div>

          {/* Provenance & Confidence Badge */}
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 text-[11px]">
            <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary text-[10px] font-medium">
              <ShieldCheck className="h-3 w-3" />
              {toUnit.provenance.confidence === "OFFICIAL_STANDARD"
                ? t("confidenceOfficial", lang)
                : t("confidenceCustomary", lang)}
            </Badge>
            <span className="text-muted-foreground text-[11px]">
              {toUnit.provenance.referenceDocument}
            </span>
          </div>

          {/* Inter-State Variance Warning if applicable */}
          {primaryResult.warning && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-800 dark:text-amber-200">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span>{primaryResult.warning}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
