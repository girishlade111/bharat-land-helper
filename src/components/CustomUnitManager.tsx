import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  CUSTOM_REFERENCE_UNITS,
  validateCustomUnitInput,
  loadCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
  type CustomReferenceUnit,
  type CustomUnitPreset,
} from "@/core/customUnits";
import { formatIndianNumber } from "@/core/formatter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Sliders,
  Plus,
  Trash2,
  AlertTriangle,
  Bookmark,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

interface CustomUnitManagerProps {
  onApplyCustomUnit?: (preset: CustomUnitPreset) => void;
}

export default function CustomUnitManager({ onApplyCustomUnit }: CustomUnitManagerProps) {
  const { lang, setConversionState } = useApp();
  const { toast } = useToast();

  const [name, setName] = useState<string>("");
  const [factorStr, setFactorStr] = useState<string>("20000");
  const [referenceUnit, setReferenceUnit] = useState<CustomReferenceUnit>("sqft");
  const [note, setNote] = useState<string>("");

  const [presets, setPresets] = useState<CustomUnitPreset[]>([]);

  useEffect(() => {
    setPresets(loadCustomPresets());
  }, []);

  const validation = useMemo(() => {
    return validateCustomUnitInput(name || "Custom Unit", factorStr, referenceUnit);
  }, [name, factorStr, referenceUnit]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: lang === "hi" ? "नाम आवश्यक है" : "Name Required",
        description: lang === "hi" ? "कृपया कस्टम इकाई का नाम दर्ज करें।" : "Please enter a descriptive name for your custom unit.",
        variant: "destructive",
      });
      return;
    }

    if (!validation.isValid) {
      toast({
        title: lang === "hi" ? "अमान्य रूपांतरण कारक" : "Invalid Conversion Factor",
        description: lang === "hi" ? (validation.errorHi || "कृपया एक मान्य संख्यात्मक रूपांतरण कारक दर्ज करें।") : (validation.error || "Please enter a valid numeric conversion factor."),
        variant: "destructive",
      });
      return;
    }

    const result = saveCustomPreset(name, factorStr, referenceUnit, note);
    if (result.success && result.preset) {
      setPresets(loadCustomPresets());
      toast({
        title: lang === "hi" ? "इकाई सहेजी गई" : "Custom Unit Saved",
        description: `${result.preset.name} (${formatIndianNumber(result.preset.sqFtEquivalent)} sq ft) ${lang === "hi" ? "ब्राउज़र में सहेजा गया।" : "saved to browser presets."}`,
      });
      setName("");
      setNote("");
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to save preset.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string, presetName: string) => {
    const updated = deleteCustomPreset(id);
    setPresets(updated);
    toast({
      title: lang === "hi" ? "हटाया गया" : "Preset Removed",
      description: `${presetName} ${lang === "hi" ? "हटा दिया गया है।" : "has been removed."}`,
    });
  };

  const handleApplyPreset = (preset: CustomUnitPreset) => {
    if (!preset || !preset.sqFtEquivalent || preset.sqFtEquivalent <= 0) {
      toast({
        title: lang === "hi" ? "अमान्य कस्टम इकाई" : "Invalid Custom Unit",
        description:
          lang === "hi"
            ? "इस कस्टम इकाई में मान्य रूपांतरण कारक नहीं है।"
            : "This custom unit preset lacks a valid positive conversion factor.",
        variant: "destructive",
      });
      return;
    }

    const customUnitId = preset.id.startsWith("custom_") ? preset.id : `custom_${preset.id}`;
    setConversionState({
      value: "1",
      fromUnitId: customUnitId,
      toUnitId: "acre",
    });

    if (onApplyCustomUnit) {
      onApplyCustomUnit(preset);
    }

    toast({
      title: lang === "hi" ? "कस्टम इकाई लागू" : "Custom Unit Applied",
      description: `${preset.name} (${formatIndianNumber(preset.sqFtEquivalent)} sq ft) ${lang === "hi" ? "मुख्य परिवर्तक में लोड किया गया।" : "loaded into main converter."}`,
    });
  };

  const refOption = CUSTOM_REFERENCE_UNITS.find((r) => r.id === referenceUnit);

  return (
    <section
      aria-labelledby="custom-unit-heading"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 id="custom-unit-heading" className="text-base sm:text-lg font-bold text-foreground">
              {lang === "hi" ? "कस्टम स्थानीय माप कारक (Custom Factor)" : "Custom Local Measurement Factor"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {lang === "hi"
                ? "जब आधिकारिक सूची में आपके गाँव या तहसील का विशिष्ट मान उपलब्ध न हो, तो अपना कस्टम रूपांतरण कारक परिभाषित करें"
                : "Define custom local customary land measurement factors when official state standards differ in your locality"}
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Mandatory Safety Warning */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:p-4 text-xs text-foreground/90 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{lang === "hi" ? "उपयोगकर्ता परिभाषित कस्टम इकाई सूचना" : "User-Defined Customary Factor Notice"}</span>
        </div>
        <p className="leading-relaxed">
          {lang === "hi"
            ? "यह सुविधा केवल व्यक्तिगत गणना के लिए है। यह कारक आपके ब्राउज़र में स्थानीय रूप से संग्रहीत होता है और यह कोई वैधानिक (Statutory) या सरकारी प्रमाणित माप नहीं है।"
            : "Factors defined here are user-specified and saved locally in your browser storage only. They do not alter the verified master dataset, are not statutory or government-certified, and will not affect public conversion landing pages."}
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="grid gap-3.5 sm:grid-cols-3">
          {/* Custom Unit Name */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-unit-name" className="text-xs font-semibold text-foreground">
              {lang === "hi" ? "कस्टम इकाई का नाम" : "Custom Unit Name"}
            </Label>
            <Input
              id="custom-unit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pali Tehsil Bigha"
              className="h-10 rounded-xl text-sm"
              maxLength={50}
            />
          </div>

          {/* Factor Input */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-unit-factor" className="text-xs font-semibold text-foreground">
              {lang === "hi" ? "कारक मान (Multiplier)" : "Conversion Factor Value"}
            </Label>
            <Input
              id="custom-unit-factor"
              type="text"
              inputMode="decimal"
              value={factorStr}
              onChange={(e) => setFactorStr(e.target.value)}
              placeholder="e.g. 20000"
              className="h-10 rounded-xl text-sm font-mono font-semibold"
            />
            {factorStr.trim() && !validation.isValid && (
              <p id="custom-unit-factor-error" className="text-[11px] font-medium text-destructive mt-1">
                {lang === "hi" ? validation.errorHi : validation.error}
              </p>
            )}
          </div>

          {/* Reference Unit */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-ref-unit" className="text-xs font-semibold text-foreground">
              {lang === "hi" ? "संदर्भ इकाई (Reference Unit)" : "Reference Standard Unit"}
            </Label>
            <Select value={referenceUnit} onValueChange={(val: CustomReferenceUnit) => setReferenceUnit(val)}>
              <SelectTrigger id="custom-ref-unit" className="h-10 rounded-xl text-xs sm:text-sm font-medium">
                <SelectValue placeholder={refOption?.name} />
              </SelectTrigger>
              <SelectContent>
                {CUSTOM_REFERENCE_UNITS.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {lang === "hi" ? r.nameHi : r.name} ({r.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Optional Note */}
        <div className="space-y-1.5">
          <Label htmlFor="custom-unit-note" className="text-xs font-medium text-muted-foreground">
            {lang === "hi" ? "टिप्पणी / तहसील संदर्भ (वैकल्पिक)" : "Local Notes / Tehsil or Lagga Context (Optional)"}
          </Label>
          <Input
            id="custom-unit-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Based on local 6.25-haath lagga custom in district deeds"
            className="h-9 rounded-xl text-xs"
          />
        </div>

        {/* Live Factor Preview Card */}
        {validation.isValid && (
          <div className="rounded-xl border border-primary/20 bg-background p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Calculated Canonical Value:
              </span>
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-lg font-bold text-foreground">1 {name || "Custom Unit"} =</span>
                <span className="text-lg font-extrabold text-primary">
                  {formatIndianNumber(validation.sqFtEquivalent, { maxDecimals: 2 })} sq ft
                </span>
                <span className="text-xs text-muted-foreground">
                  (≈ {formatIndianNumber(validation.sqFtEquivalent / 43560, { maxDecimals: 4 })} Acre)
                </span>
              </div>
            </div>

            <Button type="submit" size="sm" className="gap-1.5 rounded-xl text-xs font-semibold h-9 shrink-0">
              <Bookmark className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? "प्रीसेट सहेजें" : "Save Preset"}</span>
            </Button>
          </div>
        )}
      </form>

      {/* Saved Presets Section */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
          <span>{lang === "hi" ? "सहेजे गए कस्टम प्रीसेट" : "Your Saved Custom Unit Presets"}</span>
          <span className="text-xs font-normal text-muted-foreground">({presets.length} saved)</span>
        </h3>

        {presets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
            {lang === "hi"
              ? "कोई कस्टम प्रीसेट सहेजा नहीं गया है। उपरोक्त फॉर्म से नया स्थानीय रूपांतरण मान जोड़ें।"
              : "No custom measurement presets saved yet. Define a custom local factor above to save it in your browser."}
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {presets.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-border bg-card p-3.5 flex items-start justify-between gap-3 shadow-xs hover:border-primary/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{p.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
                      Custom
                    </span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-primary">
                    1 unit = {formatIndianNumber(p.sqFtEquivalent, { maxDecimals: 2 })} sq ft
                  </div>
                  {p.note && (
                    <p className="text-[11px] text-muted-foreground italic line-clamp-1">{p.note}</p>
                  )}
                  <div className="text-[10px] text-muted-foreground pt-0.5">
                    1 unit = {formatIndianNumber(p.factor)} {p.referenceUnit}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPreset(p)}
                    className="h-8 px-2 text-xs gap-1 rounded-lg"
                    title="Load into Converter"
                  >
                    <span>Use</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(p.id, p.name)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
                    title="Delete Preset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
