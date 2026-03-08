import { useApp } from "@/context/AppContext";
import { UNITS } from "@/data/units";
import { t } from "@/data/translations";

export default function AreaVisual() {
  const { lang, inputValue, fromUnitId } = useApp();

  const numValue = parseFloat(inputValue);
  const fromUnit = UNITS.find((u) => u.id === fromUnitId);
  if (!fromUnit || isNaN(numValue) || numValue <= 0) return null;

  const totalSqft = numValue * fromUnit.sqft;
  const side = Math.sqrt(totalSqft);

  // Determine scale label
  let label = "";
  let emoji = "🌱";
  if (totalSqft < 1000) {
    label = `${side.toFixed(1)} ft × ${side.toFixed(1)} ft`;
    emoji = "🌱";
  } else if (totalSqft < 43560) {
    const guntha = totalSqft / 1089;
    label = `≈ ${guntha.toFixed(2)} Guntha`;
    emoji = "🌾";
  } else {
    const acre = totalSqft / 43560;
    label = `≈ ${acre.toFixed(2)} Acre`;
    emoji = "🏡";
  }

  // SVG square size: map totalSqft to visual size (40–200px)
  const visualSize = Math.min(200, Math.max(40, Math.log10(totalSqft + 1) * 45));

  return (
    <div className="flex flex-col items-center rounded-lg border bg-card p-4">
      <div className="mb-2 text-sm font-medium text-muted-foreground">
        {t("areaVisual", lang)}
      </div>
      <svg width={visualSize + 20} height={visualSize + 20} viewBox={`0 0 ${visualSize + 20} ${visualSize + 20}`}>
        <rect
          x="10" y="10"
          width={visualSize}
          height={visualSize}
          rx="4"
          fill="hsl(142, 76%, 36%)"
          fillOpacity="0.15"
          stroke="hsl(142, 76%, 36%)"
          strokeWidth="2"
        />
        <text
          x={(visualSize + 20) / 2}
          y={(visualSize + 20) / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-2xl"
          fontSize="24"
        >
          {emoji}
        </text>
      </svg>
      <div className="mt-2 text-center text-sm font-semibold text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground">
        {Math.round(totalSqft).toLocaleString("en-IN")} sq ft
      </div>
    </div>
  );
}
