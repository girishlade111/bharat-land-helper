import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  COMPOUND_SYSTEMS,
  calculateCompoundArea,
  decomposeAreaIntoSystem,
  parseStrictCompoundQuantity,
  type CompoundSystem,
  type CompoundCalculationResult,
} from "@/core/compoundUnits";
import { formatIndianNumber } from "@/core/formatter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Layers,
  Copy,
  ArrowRight,
  BookOpen,
  Split,
  PlusCircle,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

interface CompoundUnitConverterProps {
  onTransferToConverter?: (areaSqFt: number) => void;
}

export default function CompoundUnitConverter({ onTransferToConverter }: CompoundUnitConverterProps) {
  const { lang, toUnit, availableUnits, setConversionState } = useApp();
  const { toast } = useToast();

  const [selectedSystemId, setSelectedSystemId] = useState<string>("up_pucca");
  const [subunitInputs, setSubunitInputs] = useState<Record<string, string>>({
    bigha: "2",
    biswa: "5",
    biswansi: "10",
  });

  // Reverse decomposition state
  const [reverseSqFtInput, setReverseSqFtInput] = useState<string>("50000");

  const currentSystem = useMemo<CompoundSystem>(() => {
    return COMPOUND_SYSTEMS.find((s) => s.id === selectedSystemId) || COMPOUND_SYSTEMS[0];
  }, [selectedSystemId]);

  const calculation = useMemo<CompoundCalculationResult>(() => {
    return calculateCompoundArea(selectedSystemId, subunitInputs);
  }, [selectedSystemId, subunitInputs]);

  const reverseParsed = useMemo(() => {
    return parseStrictCompoundQuantity(reverseSqFtInput, 500_000_000_000);
  }, [reverseSqFtInput]);

  const isReverseInvalid = !reverseParsed.isValid;

  const decomposition = useMemo(() => {
    if (!reverseParsed.isValid || reverseParsed.value <= 0) {
      return [];
    }
    return decomposeAreaIntoSystem(selectedSystemId, reverseParsed.value);
  }, [selectedSystemId, reverseParsed]);

  const handleSystemChange = (systemId: string) => {
    setSelectedSystemId(systemId);
    const newSystem = COMPOUND_SYSTEMS.find((s) => s.id === systemId);
    if (newSystem) {
      // Default initial values for the new system
      const newInputs: Record<string, string> = {};
      newSystem.subunits.forEach((sub, idx) => {
        newInputs[sub.id] = idx === 0 ? "1" : "0";
      });
      setSubunitInputs(newInputs);
    }
  };

  const handleInputChange = (subunitId: string, val: string) => {
    setSubunitInputs((prev) => ({
      ...prev,
      [subunitId]: val,
    }));
  };

  const handleReset = () => {
    const newInputs: Record<string, string> = {};
    currentSystem.subunits.forEach((sub, idx) => {
      newInputs[sub.id] = idx === 0 ? "1" : "0";
    });
    setSubunitInputs(newInputs);
  };

  const handleCopySummary = () => {
    if (!calculation.isValid) {
      toast({
        title: lang === "hi" ? "अमान्य गणना" : "Invalid Calculation",
        description:
          lang === "hi"
            ? "प्रतिलिपि बनाने से पहले कृपया सभी अमान्य मानों को ठीक करें।"
            : "Please correct invalid subunit values before copying.",
        variant: "destructive",
      });
      return;
    }

    const inputParts = currentSystem.subunits
      .filter((sub) => {
        const val = calculation.values[sub.id];
        return typeof val === "number" && val > 0;
      })
      .map((sub) => `${calculation.values[sub.id]} ${sub.symbol}`)
      .join(" + ");

    const summary = [
      `🏛️ Compound Traditional Area Breakdown — Bharat Land Converter`,
      `• System: ${currentSystem.name}`,
      `• Input: ${inputParts || "0"}`,
      `• Total Area: ${formatIndianNumber(calculation.totalSqFt, { maxDecimals: 2 })} sq ft`,
      `• Acre: ${formatIndianNumber(calculation.totalAcre, { maxDecimals: 4 })} Acre`,
      `• Hectare: ${formatIndianNumber(calculation.totalHectare, { maxDecimals: 4 })} ha`,
      `• Square Metres: ${formatIndianNumber(calculation.totalSqM, { maxDecimals: 2 })} sq m`,
      `• Square Yards (Gaj): ${formatIndianNumber(calculation.totalSqYd, { maxDecimals: 2 })} sq yd`,
      `• Calculation: ${calculation.formula}`,
      `• Statutory Reference: ${currentSystem.statutoryReference}`,
      `_Calculated at land.ladestack.in_`,
    ].join("\n");

    navigator.clipboard.writeText(summary).then(() => {
      toast({
        title: lang === "hi" ? "कॉपी हो गया!" : "Summary Copied!",
        description: lang === "hi" ? "मिश्रित इकाई गणना सारांश क्लिपबोर्ड पर कॉपी किया गया।" : "Compound conversion summary copied to clipboard.",
      });
    });
  };

  const handleTransfer = () => {
    if (!calculation.isValid || calculation.totalSqFt <= 0) {
      toast({
        title: lang === "hi" ? "अमान्य मान" : "Invalid Calculation",
        description:
          lang === "hi"
            ? "कन्वर्टर में भेजने के लिए मान्य धनात्मक मान दर्ज करें।"
            : "Enter valid positive values before transferring.",
        variant: "destructive",
      });
      return;
    }
    const rounded = Math.round(calculation.totalSqFt * 1000) / 1000;

    // Ensure To unit is not sqft so immediate conversion is meaningful
    let nextTo = toUnit.id;
    if (toUnit.id === "sqft") {
      const regional = availableUnits.find((u) => u.category === "regional");
      nextTo = regional ? regional.id : "acre";
    }

    setConversionState({
      value: String(rounded),
      fromUnitId: "sqft",
      toUnitId: nextTo,
    });

    if (onTransferToConverter) {
      onTransferToConverter(rounded);
    }

    toast({
      title: lang === "hi" ? "कन्वर्टर में भेजा गया" : "Transferred to Converter",
      description: `${formatIndianNumber(rounded)} sq ft ${lang === "hi" ? "मुख्य परिवर्तक में लोड किया गया।" : "loaded into main converter."}`,
    });
  };

  return (
    <section
      aria-labelledby="compound-calc-heading"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 id="compound-calc-heading" className="text-base sm:text-lg font-bold text-foreground">
              {lang === "hi" ? "मिश्रित पारंपरिक इकाई परिवर्तक" : "Compound Traditional Unit Converter"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {lang === "hi"
                ? "बीघा + बिस्वा + बिस्वांसी, कनाल + मरला और बहु-स्तरीय पारंपरिक माप का सटीक कुल क्षेत्रफल"
                : "Calculate exact land areas with mixed units like Bigha + Biswa, Kanal + Marla, or Bigha + Kattha + Dhur"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="self-start sm:self-auto text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{lang === "hi" ? "रीसेट" : "Reset"}</span>
        </Button>
      </div>

      {/* Measurement System Selector */}
      <div className="space-y-1.5">
        <Label htmlFor="compound-system-select" className="text-xs font-semibold text-foreground">
          {lang === "hi" ? "राज्य एवं पारंपरिक प्रणाली चुनें" : "Select State & Traditional Measurement System"}
        </Label>
        <Select value={selectedSystemId} onValueChange={handleSystemChange}>
          <SelectTrigger id="compound-system-select" className="h-11 rounded-xl text-xs sm:text-sm font-semibold">
            <SelectValue placeholder={currentSystem.name} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {COMPOUND_SYSTEMS.map((sys) => (
              <SelectItem key={sys.id} value={sys.id} className="text-xs sm:text-sm">
                <span className="font-semibold">{sys.name}</span>
                <span className="text-[10px] text-muted-foreground block truncate">{sys.notes}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          <strong>Rule:</strong> {lang === "hi" ? currentSystem.notesHi : currentSystem.notes}
        </p>
      </div>

      {/* Dynamic Subunit Input Fields */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <PlusCircle className="h-3.5 w-3.5 text-primary" />
          <span>{lang === "hi" ? "मिश्रित मान दर्ज करें" : "Enter Component Quantities"}</span>
        </span>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {currentSystem.subunits.map((subunit) => {
            const isInvalid = Boolean(calculation.errors && calculation.errors[subunit.id]);
            const errorMsg = calculation.errors?.[subunit.id];
            const errorMsgHi = calculation.errorsHi?.[subunit.id];

            return (
              <div key={subunit.id} className="space-y-1">
                <Label htmlFor={`sub-${subunit.id}`} className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>{lang === "hi" ? subunit.nameHi : subunit.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {subunit.sqFt.toLocaleString("en-IN")} sq ft
                  </span>
                </Label>
                <Input
                  id={`sub-${subunit.id}`}
                  type="text"
                  inputMode="decimal"
                  value={subunitInputs[subunit.id] ?? "0"}
                  onChange={(e) => handleInputChange(subunit.id, e.target.value)}
                  placeholder="0"
                  aria-invalid={isInvalid}
                  aria-describedby={isInvalid ? `sub-error-${subunit.id}` : undefined}
                  className={`h-10 rounded-xl text-sm font-mono font-semibold transition-colors ${
                    isInvalid ? "border-destructive text-destructive focus-visible:ring-destructive" : ""
                  }`}
                  aria-label={subunit.name}
                />
                {isInvalid && (
                  <p
                    id={`sub-error-${subunit.id}`}
                    role="alert"
                    className="text-[11px] font-medium text-destructive mt-1 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{lang === "hi" ? errorMsgHi : errorMsg}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Calculated Result Showcase */}
      <div className={`rounded-2xl border ${calculation.isValid ? "border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background" : "border-destructive/30 bg-destructive/5"} p-4 sm:p-5 shadow-xs space-y-3`}>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {lang === "hi" ? "कुल संचित क्षेत्रफल" : "Total Aggregated Area"}
          </span>
          <span className={`text-[10px] sm:text-[11px] font-mono break-all ${calculation.isValid ? "text-muted-foreground" : "text-destructive font-semibold"}`}>
            {calculation.formula}
          </span>
        </div>

        {!calculation.isValid && (
          <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <div>
              <span className="font-bold block">
                {lang === "hi" ? "अमान्य मात्रा दर्ज की गई" : "Invalid Quantity Detected"}
              </span>
              <span>
                {lang === "hi"
                  ? calculation.firstErrorHi || "कृपया लाल रंग से चिह्नित सभी फ़ील्ड में मान्य गैर-ऋणात्मक मान दर्ज करें।"
                  : calculation.firstError || "Please enter valid non-negative numbers in all highlighted fields."}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            data-testid="compound-total-sqft"
            className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${calculation.isValid ? "text-foreground" : "text-destructive"}`}
          >
            {calculation.isValid ? formatIndianNumber(calculation.totalSqFt, { maxDecimals: 2 }) : "—"}
          </span>
          <span className={`text-base sm:text-lg font-semibold ${calculation.isValid ? "text-primary" : "text-destructive"}`}>
            {lang === "hi" ? "वर्ग फीट (sq ft)" : "Square Feet (sq ft)"}
          </span>
        </div>

        {/* Breakdown into standard units */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/50 text-xs">
          <div className="p-2 rounded-lg bg-background border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Acre</span>
            <span className="font-mono font-bold text-foreground text-sm">
              {calculation.isValid ? formatIndianNumber(calculation.totalAcre, { maxDecimals: 4 }) : "—"}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-background border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Hectare</span>
            <span className="font-mono font-bold text-foreground text-sm">
              {calculation.isValid ? formatIndianNumber(calculation.totalHectare, { maxDecimals: 4 }) : "—"}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-background border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Sq Metres</span>
            <span className="font-mono font-bold text-foreground text-sm">
              {calculation.isValid ? formatIndianNumber(calculation.totalSqM, { maxDecimals: 2 }) : "—"}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-background border border-border/40">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Sq Yards (Gaj)</span>
            <span className="font-mono font-bold text-foreground text-sm">
              {calculation.isValid ? formatIndianNumber(calculation.totalSqYd, { maxDecimals: 2 }) : "—"}
            </span>
          </div>
        </div>

        {/* Step-by-step breakdown list */}
        {calculation.isValid && calculation.stepBreakdown.length > 0 && (
          <div className="pt-2 text-xs space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              {lang === "hi" ? "घटक योगदान विवरण:" : "Component Breakdown:"}
            </span>
            <div className="flex flex-wrap gap-2">
              {calculation.stepBreakdown.map((b, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-muted/60 text-[11px] font-mono border border-border/40">
                  {b.count} {b.unitName} = <strong>{formatIndianNumber(b.subtotalSqFt)} sq ft</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!calculation.isValid}
            aria-disabled={!calculation.isValid}
            onClick={handleCopySummary}
            className="gap-1.5 rounded-xl text-xs font-semibold h-9"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{lang === "hi" ? "सारांश कॉपी करें" : "Copy Breakdown"}</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={!calculation.isValid || calculation.totalSqFt <= 0}
            aria-disabled={!calculation.isValid || calculation.totalSqFt <= 0}
            onClick={handleTransfer}
            className="gap-1.5 rounded-xl text-xs font-semibold h-9"
          >
            <span>{lang === "hi" ? "कन्वर्टर में भेजें" : "Transfer to Converter"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Reverse Decomposition Section */}
      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Split className="h-4 w-4 text-primary" />
          <h3 className="text-xs sm:text-sm font-bold text-foreground">
            {lang === "hi" ? "विपरीत विभाजन (Reverse Decomposition)" : "Reverse Decomposition: Split Total Sq Ft into Traditional Subunits"}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="w-full sm:max-w-xs space-y-1">
            <Label htmlFor="reverse-sqft-input" className="text-xs font-medium text-muted-foreground">
              {lang === "hi" ? "कुल क्षेत्रफल दर्ज करें (वर्ग फीट)" : "Enter Total Area (sq ft)"}
            </Label>
            <Input
              id="reverse-sqft-input"
              type="text"
              inputMode="decimal"
              value={reverseSqFtInput}
              onChange={(e) => setReverseSqFtInput(e.target.value)}
              placeholder="e.g. 50000"
              aria-invalid={isReverseInvalid}
              aria-describedby={isReverseInvalid ? "reverse-sqft-error" : undefined}
              className={`h-10 rounded-xl text-sm font-mono font-semibold transition-colors ${
                isReverseInvalid ? "border-destructive text-destructive focus-visible:ring-destructive" : ""
              }`}
            />
            {isReverseInvalid && (
              <p
                id="reverse-sqft-error"
                role="alert"
                className="text-[11px] font-medium text-destructive mt-1 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>
                  {lang === "hi"
                    ? reverseParsed.errorHi || "कृपया मान्य धनात्मक संख्या दर्ज करें।"
                    : reverseParsed.error || "Please enter a valid non-negative number."}
                </span>
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-wrap gap-2 items-center text-xs min-h-[40px]">
            {isReverseInvalid ? (
              <span className="text-xs text-destructive flex items-center gap-1.5 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{lang === "hi" ? "अमान्य इनपुट के कारण विभाजन संभव नहीं है।" : "Cannot decompose malformed area input."}</span>
              </span>
            ) : decomposition.length > 0 ? (
              decomposition.map((d, i) => (
                <div key={i} className="p-2 px-3 rounded-lg bg-primary/10 border border-primary/20 text-foreground font-mono">
                  <span className="text-primary font-bold text-sm mr-1">{d.count}</span>
                  <span className="text-xs font-medium text-muted-foreground">{d.subunitName}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                {lang === "hi" ? "विभाजन के लिए क्षेत्रफल दर्ज करें।" : "Enter an area above to view traditional breakdown."}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Statutory Reference Footer */}
      <div className="flex items-start gap-2 text-[11px] text-muted-foreground pt-1">
        <BookOpen className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
        <span>
          <strong>Cadastral Authority:</strong> {currentSystem.statutoryReference}
        </span>
      </div>
    </section>
  );
}

