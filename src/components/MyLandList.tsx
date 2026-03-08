import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { UNITS, formatIndianNumber } from "@/data/units";
import { t } from "@/data/translations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SavedLand {
  id: string;
  name: string;
  value: number;
  unitId: string;
  state: string;
  sqftTotal: number;
  date: string;
}

const STORAGE_KEY = "bharat-land-parcels";

function loadParcels(): SavedLand[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

export default function MyLandList() {
  const { lang, inputValue, fromUnitId, selectedState } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [parcels, setParcels] = useState<SavedLand[]>(loadParcels);
  const [landName, setLandName] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parcels));
  }, [parcels]);

  const handleSave = () => {
    const numValue = parseFloat(inputValue);
    const fromUnit = UNITS.find((u) => u.id === fromUnitId);
    if (!fromUnit || isNaN(numValue) || numValue <= 0 || !landName.trim()) return;

    const newParcel: SavedLand = {
      id: Date.now().toString(),
      name: landName.trim(),
      value: numValue,
      unitId: fromUnitId,
      state: selectedState,
      sqftTotal: numValue * fromUnit.sqft,
      date: new Date().toLocaleDateString("en-IN"),
    };
    setParcels((prev) => [...prev, newParcel]);
    setLandName("");
    toast({ title: t("copied", lang), description: `Saved: ${newParcel.name}` });
  };

  const handleDelete = (id: string) => {
    setParcels((prev) => prev.filter((p) => p.id !== id));
  };

  const totalSqft = parcels.reduce((sum, p) => sum + p.sqftTotal, 0);
  const totalAcre = totalSqft / 43560;
  const totalGuntha = totalSqft / 1089;

  const handleExport = () => {
    let msg = `📋 *My Land List*\n\n`;
    parcels.forEach((p, i) => {
      const u = UNITS.find((x) => x.id === p.unitId);
      msg += `${i + 1}. ${p.name} — ${p.value} ${u?.name || p.unitId} (${p.state})\n`;
    });
    msg += `\n📏 Total: ${totalAcre.toFixed(2)} Acre / ${totalGuntha.toFixed(2)} Guntha\n`;
    msg += `_via BharatLandConverter_`;
    navigator.clipboard.writeText(msg);
    toast({ title: t("copied", lang) });
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between text-base font-semibold">
          {t("myLands", lang)} ({parcels.length})
          <span className="text-lg">{open ? "▲" : "▼"}</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-3 rounded-lg border bg-card p-4">
        {/* Save form */}
        <div className="flex gap-2">
          <Input
            value={landName}
            onChange={(e) => setLandName(e.target.value)}
            placeholder={t("landName", lang)}
            className="min-h-[44px]"
          />
          <Button onClick={handleSave} className="min-h-[44px] min-w-[80px]">
            {t("save", lang)}
          </Button>
        </div>

        {/* List */}
        {parcels.length > 0 && (
          <div className="space-y-2">
            {parcels.map((p) => {
              const u = UNITS.find((x) => x.id === p.unitId);
              return (
                <div key={p.id} className="flex items-center justify-between rounded-md border bg-secondary/50 px-3 py-2">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.value} {u?.name || p.unitId} · {formatIndianNumber(p.sqftTotal)} sqft · {p.state} · {p.date}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="min-h-[44px] text-destructive">
                    🗑
                  </Button>
                </div>
              );
            })}

            {/* Total */}
            <div className="rounded-md bg-primary/10 p-3 text-center">
              <div className="text-xs text-muted-foreground">{t("totalArea", lang)}</div>
              <div className="text-sm font-bold">
                Total saved land = {totalAcre.toFixed(2)} Acre
              </div>
            </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleExport} className="w-full min-h-[44px]">
              📤 {t("export", lang)}
            </Button>
          </div>
        )}

        {/* Pro upsell */}
        {parcels.length >= 3 && (
          <div className="rounded-lg bg-accent p-4 text-center">
            <div className="text-base font-bold text-accent-foreground">
              💡 Want AI land valuation? Coming soon on ladestack.in
            </div>
          </div>
        )}
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
