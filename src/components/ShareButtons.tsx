import { useApp } from "@/context/AppContext";
import { formatIndianNumber, getUnitsForRegion } from "@/core";
import { t } from "@/data/translations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link2, MessageCircle } from "lucide-react";

export default function ShareButtons() {
  const { lang, inputValue, fromUnit, toUnit, selectedRegion, validation, primaryResult } = useApp();
  const { toast } = useToast();

  const isValid = validation.isValid && validation.parsedValue > 0;
  const isCustomFrom = fromUnit.regionCode === "CUSTOM" || fromUnit.id.startsWith("custom");
  const isCustomTo = toUnit.regionCode === "CUSTOM" || toUnit.id.startsWith("custom");
  const isCustom = isCustomFrom || isCustomTo;

  const handleShare = () => {
    let url = `${window.location.origin}${window.location.pathname}?v=${inputValue}&from=${fromUnit.id}&to=${toUnit.id}&s=${selectedRegion.code}`;
    if (isCustomFrom) {
      const cleanName = fromUnit.name.replace(/\s*\(Custom.*?\)/, "").trim();
      url += `&from_sqft=${fromUnit.sqFt}&from_name=${encodeURIComponent(cleanName)}`;
    }
    if (isCustomTo) {
      const cleanName = toUnit.name.replace(/\s*\(Custom.*?\)/, "").trim();
      url += `&to_sqft=${toUnit.sqFt}&to_name=${encodeURIComponent(cleanName)}`;
    }

    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: t("copied", lang),
        description: isCustom
          ? `Link copied with portable ${fromUnit.name} factor snapshot`
          : url,
      });
    }).catch(() => {
      toast({
        title: "Could not copy link",
        description: "Clipboard access was blocked.",
      });
    });
  };

  const handleWhatsApp = () => {
    if (!isValid || !primaryResult) return;

    // Pick top relevant units for the state + standard units
    const regionUnits = getUnitsForRegion(selectedRegion.code);
    const summaryUnits = regionUnits.slice(0, 5);

    let msg = `🇮🇳 *Bharat Land Converter*\n`;
    msg += `📍 ${formatIndianNumber(validation.parsedValue)} ${fromUnit.name} (${selectedRegion.name})\n\n`;
    msg += `👉 *Result:* ${primaryResult.formattedResult} ${toUnit.name}\n`;
    msg += `📐 *Formula:* ${primaryResult.formula}\n\n`;

    if (isCustomFrom) {
      msg += `ℹ️ _Custom Unit Factor: 1 ${fromUnit.name} = ${formatIndianNumber(fromUnit.sqFt)} sq ft_\n\n`;
    }
    if (isCustomTo) {
      msg += `ℹ️ _Custom Unit Factor: 1 ${toUnit.name} = ${formatIndianNumber(toUnit.sqFt)} sq ft_\n\n`;
    }

    msg += `*Key Equivalents:*\n`;

    summaryUnits.forEach((u) => {
      if (u.id !== fromUnit.id) {
        const factor = fromUnit.sqFt / u.sqFt;
        const val = validation.parsedValue * factor;
        msg += `• ${u.name}: ${formatIndianNumber(val, { maxDecimals: 3 })}\n`;
      }
    });

    msg += `\n_Free & Source-Backed: land.ladestack.in_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="h-10 flex-1 gap-2 rounded-xl border-border/70 text-xs font-semibold"
        aria-label={t("share", lang)}
      >
        <Link2 className="h-3.5 w-3.5" />
        <span>{t("share", lang)}</span>
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={handleWhatsApp}
        disabled={!isValid}
        className="h-10 flex-1 gap-2 rounded-xl bg-[#25D366] text-xs font-semibold text-white hover:bg-[#20bd5a] shadow-xs"
        aria-label={t("shareWA", lang)}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span>{t("shareWA", lang)}</span>
      </Button>
    </div>
  );
}
