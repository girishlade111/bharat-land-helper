import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { getUnit, formatIndianNumber } from "@/core";
import { t } from "@/data/translations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bookmark, ChevronDown, Trash2, Upload, Plus } from "lucide-react";

interface SavedLand {
  id: string;
  name: string;
  value: number;
  unitId: string;
  stateCode: string;
  stateName: string;
  sqftTotal: number;
  date: string;
}

const STORAGE_KEY = "bharat-land-parcels-v2";

function loadParcels(): SavedLand[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function MyLandList() {
  const { lang, fromUnit, validation, selectedRegion } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [parcels, setParcels] = useState<SavedLand[]>(loadParcels);
  const [landName, setLandName] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parcels));
    } catch {
      // Storage unavailable or full
    }
  }, [parcels]);

  const handleSave = () => {
    if (!validation.isValid || validation.parsedValue <= 0 || !landName.trim()) {
      return;
    }

    const newParcel: SavedLand = {
      id: Date.now().toString(),
      name: landName.trim(),
      value: validation.parsedValue,
      unitId: fromUnit.id,
      stateCode: selectedRegion.code,
      stateName: selectedRegion.name,
      sqftTotal: validation.parsedValue * fromUnit.sqFt,
      date: new Date().toLocaleDateString("en-IN"),
    };

    setParcels((prev) => [...prev, newParcel]);
    setLandName("");
    toast({
      title: t("saved", lang),
      description: `${newParcel.name}: ${formatIndianNumber(newParcel.value)} ${fromUnit.name}`,
    });
  };

  const handleDelete = (id: string) => {
    setParcels((prev) => prev.filter((p) => p.id !== id));
  };

  const totalSqft = parcels.reduce((sum, p) => sum + p.sqftTotal, 0);
  const totalAcre = totalSqft / 43560;

  const handleExport = () => {
    if (parcels.length === 0) return;
    let msg = `📋 *My Land Parcels*\n\n`;
    parcels.forEach((p, i) => {
      const u = getUnit(p.unitId);
      msg += `${i + 1}. *${p.name}*: ${formatIndianNumber(p.value)} ${u?.name || p.unitId} (${p.stateName})\n`;
    });
    msg += `\n📏 *Total Area*: ${formatIndianNumber(totalAcre, { maxDecimals: 3 })} Acre (${formatIndianNumber(totalSqft)} sq ft)\n`;
    msg += `_via Bharat Land Converter_`;

    navigator.clipboard.writeText(msg).then(() => {
      toast({
        title: t("copied", lang),
        description: "Parcel summary copied to clipboard for WhatsApp",
      });
    }).catch(() => {
      // Ignore
    });
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          id="my-lands-toggle"
          variant="outline"
          className="w-full justify-between rounded-2xl border-border/70 p-4 h-auto text-sm font-semibold hover:bg-secondary/40 shadow-xs"
        >
          <span className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bookmark className="h-4 w-4" />
            </div>
            <span>{t("myLands", lang)} ({parcels.length})</span>
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 animate-fade-in space-y-3 rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
        {/* Save Form */}
        <div className="flex gap-2">
          <Input
            id="parcel-name-input"
            value={landName}
            onChange={(e) => setLandName(e.target.value)}
            placeholder={t("landName", lang)}
            className="h-11 rounded-xl border-border/70 bg-background text-sm font-medium flex-1"
          />
          <Button
            id="save-parcel-btn"
            type="button"
            onClick={handleSave}
            disabled={!validation.isValid || !landName.trim()}
            className="h-11 px-4 rounded-xl gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>{t("save", lang)}</span>
          </Button>
        </div>

        {/* Parcel List */}
        {parcels.length > 0 && (
          <div className="space-y-2 pt-1">
            {parcels.map((p) => {
              const u = getUnit(p.unitId);
              return (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3">
                  <div>
                    <div className="text-sm font-bold text-foreground">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatIndianNumber(p.value)} {u?.name || p.unitId} · {formatIndianNumber(p.sqftTotal)} sq ft · {p.stateName}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(p.id)}
                    className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    aria-label={`Delete ${p.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            {/* Total Summary */}
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {t("totalArea", lang)}
              </div>
              <div className="mt-0.5 text-base font-extrabold text-foreground tabular-nums">
                {formatIndianNumber(totalAcre, { maxDecimals: 3 })} Acre ({formatIndianNumber(totalSqft)} sq ft)
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="w-full h-10 gap-2 rounded-xl border-border/70 text-xs font-semibold"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{t("export", lang)}</span>
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
