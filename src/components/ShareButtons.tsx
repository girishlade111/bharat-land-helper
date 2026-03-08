import { useApp } from "@/context/AppContext";
import { UNITS, convert, formatIndianNumber } from "@/data/units";
import { t } from "@/data/translations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ShareButtons() {
  const { lang, inputValue, fromUnitId, selectedState } = useApp();
  const { toast } = useToast();

  const numValue = parseFloat(inputValue);
  const fromUnit = UNITS.find((u) => u.id === fromUnitId);
  const isValid = !isNaN(numValue) && numValue > 0 && fromUnit;

  const handleShare = () => {
    const url = `${window.location.origin}?v=${inputValue}&u=${fromUnitId}&s=${encodeURIComponent(selectedState)}`;
    navigator.clipboard.writeText(url);
    toast({ title: t("copied", lang), description: url });
  };

  const handleWhatsApp = () => {
    if (!isValid) return;
    const top6 = ["sqft", "sqm", "sqyd", "acre", "guntha_mh", "hectare"];
    let msg = `🇮🇳 *Bharat Land Converter*\n\n`;
    msg += `📍 ${numValue} ${fromUnit!.name} (${selectedState})\n\n`;
    for (const id of top6) {
      const u = UNITS.find((x) => x.id === id);
      if (u) {
        const val = convert(numValue, fromUnit!.sqft, u.sqft);
        msg += `📐 ${u.name}: ${formatIndianNumber(val)}\n`;
      }
    }
    msg += `\n_Calculated by ladestack.in_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleShare} className="min-h-[44px] flex-1">
        🔗 {t("share", lang)}
      </Button>
      <Button
        size="sm"
        onClick={handleWhatsApp}
        disabled={!isValid}
        className="min-h-[44px] flex-1 bg-primary hover:bg-primary/90"
      >
        💬 {t("shareWA", lang)}
      </Button>
    </div>
  );
}
