import { useApp } from "@/context/AppContext";
import { formatIndianNumber } from "@/core";
import { t } from "@/data/translations";

export default function AreaVisual() {
  const { lang, fromUnit, validation, toUnit, primaryResult } = useApp();

  if (!validation.isValid || validation.parsedValue <= 0) return null;

  const totalSqft = validation.parsedValue * fromUnit.sqFt;
  const sideFt = Math.sqrt(totalSqft);
  const sideMeters = sideFt * 0.3048;

  // Visual SVG boundary dimension
  const visualDimension = Math.min(180, Math.max(60, Math.log10(totalSqft + 1) * 38));

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border/70 bg-card p-4 shadow-sm text-center">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
        {t("areaVisual", lang)}
      </span>

      {/* Clean Survey Plot Diagram with Dimension Markers */}
      <div className="relative my-2 flex items-center justify-center">
        <svg
          width={visualDimension + 36}
          height={visualDimension + 36}
          viewBox={`0 0 ${visualDimension + 36} ${visualDimension + 36}`}
          className="overflow-visible"
          role="img"
          aria-label={`Square plot visualization of ${formatIndianNumber(totalSqft)} square feet`}
        >
          <defs>
            <linearGradient id="plotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
            </linearGradient>
          </defs>

          {/* Plot Boundary */}
          <rect
            x="18"
            y="18"
            width={visualDimension}
            height={visualDimension}
            rx="6"
            fill="url(#plotGradient)"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Corner Survey Pegs */}
          <circle cx="18" cy="18" r="3" fill="hsl(var(--primary))" />
          <circle cx={18 + visualDimension} cy="18" r="3" fill="hsl(var(--primary))" />
          <circle cx="18" cy={18 + visualDimension} r="3" fill="hsl(var(--primary))" />
          <circle cx={18 + visualDimension} cy={18 + visualDimension} r="3" fill="hsl(var(--primary))" />

          {/* Dimension Label in Center */}
          <text
            x={18 + visualDimension / 2}
            y={18 + visualDimension / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[11px] font-mono font-bold fill-foreground"
          >
            {formatIndianNumber(totalSqft, { maxDecimals: 0 })} sq ft
          </text>
        </svg>
      </div>

      {/* Side Dimensions */}
      <div className="text-xs font-bold text-foreground">
        ≈ {formatIndianNumber(sideFt, { maxDecimals: 1 })} ft × {formatIndianNumber(sideFt, { maxDecimals: 1 })} ft
      </div>
      <div className="text-[11px] text-muted-foreground tabular-nums">
        ({formatIndianNumber(sideMeters, { maxDecimals: 1 })} m × {formatIndianNumber(sideMeters, { maxDecimals: 1 })} m)
      </div>

      {/* Local unit equivalent */}
      {primaryResult && (
        <div className="mt-2 pt-2 border-t border-border/40 w-full text-xs font-semibold text-primary">
          = {primaryResult.formattedResult} {lang === "hi" ? toUnit.nameHi : toUnit.name}
        </div>
      )}
    </div>
  );
}
