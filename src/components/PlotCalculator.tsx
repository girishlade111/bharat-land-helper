import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  calculatePlotArea,
  LENGTH_UNITS,
  type LengthUnit,
  type PlotCalculationResult,
} from "@/core/plotCalculator";
import { formatIndianNumber } from "@/core/formatter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Ruler,
  Copy,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

interface PlotCalculatorProps {
  onTransferToConverter?: (areaSqFt: number) => void;
}

export default function PlotCalculator({ onTransferToConverter }: PlotCalculatorProps) {
  const { lang, selectedRegion, toUnit, availableUnits, setConversionState } = useApp();
  const { toast } = useToast();

  const [lengthStr, setLengthStr] = useState<string>("50");
  const [widthStr, setWidthStr] = useState<string>("30");
  const [unit, setUnit] = useState<LengthUnit>("ft");

  const calculation = useMemo<PlotCalculationResult>(() => {
    return calculatePlotArea(lengthStr, widthStr, unit);
  }, [lengthStr, widthStr, unit]);

  const handleCopySummary = () => {
    if (!calculation.isValid) return;

    const unitLabel = LENGTH_UNITS.find((u) => u.id === unit)?.symbol || unit;
    const summary = [
      `📐 Rectangular Plot Area Calculation — Bharat Land Converter`,
      `• Length: ${formatIndianNumber(calculation.length)} ${unitLabel}`,
      `• Width: ${formatIndianNumber(calculation.width)} ${unitLabel}`,
      `• Total Area: ${formatIndianNumber(calculation.areaSqFt, { maxDecimals: 2 })} sq ft`,
      `• Square Metres: ${formatIndianNumber(calculation.breakdown.sqM, { maxDecimals: 2 })} sq m`,
      `• Square Yards (Gaj): ${formatIndianNumber(calculation.breakdown.sqYd, { maxDecimals: 2 })} sq yd`,
      `• Acre: ${formatIndianNumber(calculation.breakdown.acre, { maxDecimals: 4 })} Acre`,
      `• Hectare: ${formatIndianNumber(calculation.breakdown.hectare, { maxDecimals: 4 })} ha`,
      `• State Equivalent (${selectedRegion.name}): ${
        selectedRegion.code === "MH"
          ? `${formatIndianNumber(calculation.breakdown.gunthaMH, { maxDecimals: 3 })} Guntha`
          : selectedRegion.code === "UP"
          ? `${formatIndianNumber(calculation.breakdown.bighaUPPucca, { maxDecimals: 3 })} Pucca Bigha`
          : `${formatIndianNumber(calculation.breakdown.cent, { maxDecimals: 2 })} Cent`
      }`,
      `• Perimeter: ${formatIndianNumber(calculation.perimeter)} ${unitLabel} (${formatIndianNumber(calculation.perimeterFt)} ft)`,
      `_Calculated at land.ladestack.in_`,
    ].join("\n");

    navigator.clipboard.writeText(summary).then(() => {
      toast({
        title: lang === "hi" ? "कॉपी हो गया!" : "Summary Copied!",
        description: lang === "hi" ? "भूखंड क्षेत्रफल सारांश क्लिपबोर्ड पर कॉपी किया गया।" : "Plot dimensions and area summary copied to clipboard.",
      });
    });
  };

  const handleTransfer = () => {
    if (!calculation.isValid || calculation.areaSqFt <= 0) {
      toast({
        title: lang === "hi" ? "अमान्य मान" : "Invalid Calculation",
        description:
          lang === "hi"
            ? "कन्वर्टर में भेजने के लिए मान्य धनात्मक विमाएं दर्ज करें।"
            : "Enter valid positive dimensions before transferring.",
        variant: "destructive",
      });
      return;
    }
    const rounded = Math.round(calculation.areaSqFt * 1000) / 1000;

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

  const handleReset = () => {
    setLengthStr("50");
    setWidthStr("30");
    setUnit("ft");
  };

  // SVG Dimension scaling (keep aspect ratio visually reasonable between 1:3 and 3:1)
  const svgDimensions = useMemo(() => {
    const rawRatio = calculation.isValid && calculation.width > 0 ? calculation.length / calculation.width : 5 / 3;
    const clampedRatio = Math.max(0.35, Math.min(rawRatio, 2.8));

    const baseWidth = 260;
    let svgW = baseWidth;
    let svgH = baseWidth / clampedRatio;

    if (svgH > 160) {
      svgH = 160;
      svgW = svgH * clampedRatio;
    }
    if (svgH < 65) {
      svgH = 65;
      svgW = svgH * clampedRatio;
    }

    return { w: Math.round(svgW), h: Math.round(svgH) };
  }, [calculation]);

  const unitOption = LENGTH_UNITS.find((u) => u.id === unit);

  return (
    <section
      aria-labelledby="plot-calc-heading"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Ruler className="h-5 w-5" />
          </div>
          <div>
            <h2 id="plot-calc-heading" className="text-base sm:text-lg font-bold text-foreground">
              {lang === "hi" ? "प्लॉट विमा क्षेत्रफल कैलकुलेटर" : "Plot Dimensions Calculator"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {lang === "hi"
                ? "आयताकार भूखंड (लंबाई × चौड़ाई) का क्षेत्रफल और सभी इकाइयों में रूपांतरण"
                : "Calculate rectangular plot area (Length × Width) and view instant multi-unit conversions"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="self-start sm:self-auto text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2.5"
          title="Reset to 50 × 30 ft"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{lang === "hi" ? "रीसेट" : "Reset"}</span>
        </Button>
      </div>

      {/* Input Form */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        {/* Length Input */}
        <div className="space-y-1.5">
          <Label htmlFor="plot-length-input" className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>{lang === "hi" ? "लंबाई (Length)" : "Plot Length"}</span>
            <span className="text-[10px] text-muted-foreground font-normal">Side A</span>
          </Label>
          <Input
            id="plot-length-input"
            type="text"
            inputMode="decimal"
            value={lengthStr}
            onChange={(e) => setLengthStr(e.target.value)}
            placeholder="e.g. 50"
            className="h-11 rounded-xl text-sm font-semibold font-mono"
            aria-label="Plot Length"
          />
        </div>

        {/* Width Input */}
        <div className="space-y-1.5">
          <Label htmlFor="plot-width-input" className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>{lang === "hi" ? "चौड़ाई (Width)" : "Plot Width"}</span>
            <span className="text-[10px] text-muted-foreground font-normal">Side B</span>
          </Label>
          <Input
            id="plot-width-input"
            type="text"
            inputMode="decimal"
            value={widthStr}
            onChange={(e) => setWidthStr(e.target.value)}
            placeholder="e.g. 30"
            className="h-11 rounded-xl text-sm font-semibold font-mono"
            aria-label="Plot Width"
          />
        </div>

        {/* Unit Selector */}
        <div className="space-y-1.5">
          <Label htmlFor="plot-unit-select" className="text-xs font-semibold text-foreground">
            {lang === "hi" ? "माप इकाई (Unit)" : "Measurement Unit"}
          </Label>
          <Select value={unit} onValueChange={(val: LengthUnit) => setUnit(val)}>
            <SelectTrigger id="plot-unit-select" className="h-11 rounded-xl text-xs sm:text-sm font-medium">
              <SelectValue placeholder={unitOption?.name} />
            </SelectTrigger>
            <SelectContent>
              {LENGTH_UNITS.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {lang === "hi" ? u.nameHi : u.name} ({u.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Validation Message if invalid */}
      {!calculation.isValid && (
        <div role="alert" className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{lang === "hi" ? calculation.errorMessageHi : calculation.errorMessage}</span>
        </div>
      )}

      {/* Calculation Display & Visualizer */}
      {calculation.isValid && (
        <div className="grid gap-4 lg:grid-cols-[1fr_260px] items-start pt-1">
          {/* Main Area Result Card */}
          <div className="space-y-3.5">
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-4 sm:p-5 shadow-xs space-y-2">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {lang === "hi" ? "कुल भूखंड क्षेत्रफल" : "Total Plot Area"}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {calculation.formula}
                </span>
              </div>

              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  data-testid="plot-primary-sqft"
                  className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-foreground"
                >
                  {formatIndianNumber(calculation.areaSqFt, { maxDecimals: 2 })}
                </span>
                <span className="text-base sm:text-lg font-semibold text-primary">
                  {lang === "hi" ? "वर्ग फीट (sq ft)" : "Square Feet (sq ft)"}
                </span>
              </div>

              {/* Sub-breakdown in metres and yards */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1 border-t border-border/50">
                <span>
                  <strong>{formatIndianNumber(calculation.breakdown.sqM, { maxDecimals: 2 })}</strong> sq m
                </span>
                <span>•</span>
                <span>
                  <strong>{formatIndianNumber(calculation.breakdown.sqYd, { maxDecimals: 2 })}</strong> Gaj / sq yd
                </span>
                <span>•</span>
                <span>
                  Perimeter: <strong>{formatIndianNumber(calculation.perimeter)}</strong> {unitOption?.symbol} ({formatIndianNumber(calculation.perimeterFt)} ft)
                </span>
              </div>
            </div>

            {/* Quick Conversion Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Acre</span>
                <span className="font-mono font-bold text-foreground text-sm block">
                  {formatIndianNumber(calculation.breakdown.acre, { maxDecimals: 4 })}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Hectare</span>
                <span className="font-mono font-bold text-foreground text-sm block">
                  {formatIndianNumber(calculation.breakdown.hectare, { maxDecimals: 4 })}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  {selectedRegion.code === "MH" ? "MH Guntha" : selectedRegion.code === "UP" ? "UP Pucca Bigha" : "Cent (South)"}
                </span>
                <span className="font-mono font-bold text-primary text-sm block">
                  {selectedRegion.code === "MH"
                    ? formatIndianNumber(calculation.breakdown.gunthaMH, { maxDecimals: 3 })
                    : selectedRegion.code === "UP"
                    ? formatIndianNumber(calculation.breakdown.bighaUPPucca, { maxDecimals: 3 })
                    : formatIndianNumber(calculation.breakdown.cent, { maxDecimals: 3 })}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">WB Bigha</span>
                <span className="font-mono font-bold text-foreground text-sm block">
                  {formatIndianNumber(calculation.breakdown.bighaWB, { maxDecimals: 3 })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopySummary}
                className="gap-1.5 rounded-xl text-xs font-semibold h-9"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{lang === "hi" ? "सारांश कॉपी करें" : "Copy Summary"}</span>
              </Button>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleTransfer}
                className="gap-1.5 rounded-xl text-xs font-semibold h-9"
              >
                <span>{lang === "hi" ? "कन्वर्टर में भेजें" : "Transfer to Converter"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* SVG Plot Visualizer */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {lang === "hi" ? "भूखंड ज्यामिति" : "Plot Geometry (2D)"}
            </span>

            <div className="w-full flex items-center justify-center min-h-[170px]">
              <svg
                width={svgDimensions.w + 40}
                height={svgDimensions.h + 40}
                viewBox={`0 0 ${svgDimensions.w + 40} ${svgDimensions.h + 40}`}
                className="overflow-visible"
              >
                {/* Length Label (Top) */}
                <text
                  x={svgDimensions.w / 2 + 20}
                  y={14}
                  textAnchor="middle"
                  className="fill-foreground font-mono text-[11px] font-bold"
                >
                  {calculation.length} {unitOption?.symbol}
                </text>

                {/* Plot Rectangle */}
                <rect
                  x={20}
                  y={20}
                  width={svgDimensions.w}
                  height={svgDimensions.h}
                  rx={6}
                  className="fill-primary/10 stroke-primary stroke-2"
                />

                {/* Center Area Label */}
                <text
                  x={svgDimensions.w / 2 + 20}
                  y={svgDimensions.h / 2 + 16}
                  textAnchor="middle"
                  className="fill-primary font-mono text-[11px] font-bold"
                >
                  {formatIndianNumber(calculation.areaSqFt, { maxDecimals: 0 })} sq ft
                </text>
                <text
                  x={svgDimensions.w / 2 + 20}
                  y={svgDimensions.h / 2 + 30}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px]"
                >
                  {calculation.length} × {calculation.width} {unitOption?.symbol}
                </text>

                {/* Width Label (Right side) */}
                <text
                  x={svgDimensions.w + 30}
                  y={svgDimensions.h / 2 + 24}
                  textAnchor="start"
                  className="fill-foreground font-mono text-[11px] font-bold"
                >
                  {calculation.width} {unitOption?.symbol}
                </text>
              </svg>
            </div>

            <span className="text-[10px] text-muted-foreground text-center">
              Aspect Ratio: {calculation.aspectRatio.toFixed(2)}:1
            </span>
            <span className="text-[9px] text-muted-foreground/75 text-center italic">
              {lang === "hi"
                ? "योजनाबद्ध आरेख (Schematic): प्रदर्शन स्पष्टता के लिए पहलू अनुपात सामान्यीकृत है; यह स्केल-सटीक इंजीनियरिंग नक्शा नहीं है।"
                : "Schematic Diagram: Aspect ratio is visually clamped for UI clarity; not a scale-accurate engineering or cadastral survey blueprint."}
            </span>
          </div>
        </div>
      )}

      {/* Domain Notice: Rectangular limitation */}
      <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
        <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
        <div>
          <strong>{lang === "hi" ? "सूचना:" : "Cadastral Notice:"}</strong>{" "}
          {lang === "hi"
            ? "यह कैलकुलेटर आयताकार (4 समकोण) भूखंडों के लिए है। अनियमित आकारों (त्रिकोणीय, चतुर्भुज) के लिए कैडस्ट्रल सर्वेक्षण त्रिभुजीकरण की आवश्यकता होती है।"
            : "This tool calculates rectangular plots (Length × Width with 90° corners). Irregular, curved, or non-parallel land parcels require cadastral survey triangulation (Gunter chain or ETS measurement)."}
        </div>
      </div>
    </section>
  );
}

