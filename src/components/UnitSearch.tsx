import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { ALL_UNITS, type LandUnit } from "@/core";
import { t } from "@/data/translations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, ArrowRight, CornerDownRight } from "lucide-react";

export default function UnitSearch() {
  const { lang, setConversionState } = useApp();
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    return ALL_UNITS.filter((u) => {
      const matchName = u.name.toLowerCase().includes(q);
      const matchHi = u.nameHi.includes(q);
      const matchId = u.id.toLowerCase().includes(q);
      const matchAliases = u.aliases.some((a) => a.toLowerCase().includes(q));
      const matchRegion = (u.regionName || "").toLowerCase().includes(q);
      return matchName || matchHi || matchId || matchAliases || matchRegion;
    });
  }, [query]);

  const handleSelectUnit = (unit: LandUnit, role: "to" | "from") => {
    const updates: {
      fromUnitId?: string;
      toUnitId?: string;
      regionCode?: string;
    } = {};

    if (unit.category === "regional" && unit.regionCode !== "ALL") {
      updates.regionCode = unit.regionCode;
    }

    if (role === "from") {
      updates.fromUnitId = unit.id;
    } else {
      updates.toUnitId = unit.id;
    }

    setConversionState(updates);
    setQuery("");
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="interactive-unit-search" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-primary" />
          <span>{lang === "hi" ? "त्वरित इकाई खोज" : "Interactive Unit Search"}</span>
        </label>
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          id="interactive-unit-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchUnit", lang)}
          className="h-11 rounded-xl border-border/70 pl-10 pr-4 text-sm bg-background font-medium"
        />
      </div>

      {/* Interactive Results Dropdown / List */}
      {searchResults.length > 0 && (
        <div className="space-y-2 pt-1 animate-fade-in max-h-[300px] overflow-y-auto pr-1">
          <p className="text-[11px] text-muted-foreground">
            {searchResults.length} {lang === "hi" ? "इकाइयाँ मिलीं — चयन करें:" : "units found — click to convert:"}
          </p>
          <div className="space-y-1.5">
            {searchResults.map((u) => (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border/60 bg-secondary/30 p-2.5 hover:bg-secondary/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {lang === "hi" ? u.nameHi : u.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-medium py-0 px-1.5">
                      {u.category === "regional" ? u.regionName || u.regionCode : "Standard"}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    1 {u.name} = {u.sqFt.toLocaleString()} sq ft · {u.note}
                  </div>
                </div>

                {/* Action Buttons to set as From or To unit */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectUnit(u, "from")}
                    className="h-7 text-[11px] rounded-lg px-2"
                  >
                    Set as From
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSelectUnit(u, "to")}
                    className="h-7 text-[11px] rounded-lg px-2.5 gap-1"
                  >
                    <span>Convert To</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {query.length >= 2 && searchResults.length === 0 && (
        <p className="text-xs text-muted-foreground py-2 text-center">
          No matching land units found for "{query}". Try searching by state (e.g. "Punjab") or unit name (e.g. "Bigha").
        </p>
      )}
    </div>
  );
}
