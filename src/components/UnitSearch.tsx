import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { UNITS } from "@/data/units";
import { t } from "@/data/translations";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function UnitSearch() {
  const { lang } = useApp();
  const [query, setQuery] = useState("");

  const results = query.length >= 2
    ? UNITS.filter((u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.nameHi.includes(query) ||
        u.id.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchUnit", lang)}
          className="min-h-[44px] rounded-lg border-border/60 pl-10"
        />
      </div>
      {results.length > 0 && (
        <div className="mt-3 space-y-1.5 animate-fade-in">
          {results.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
              <div>
                <span className="font-semibold text-foreground">{lang === "hi" ? u.nameHi : u.name}</span>
                <span className="ml-2 text-[11px] text-muted-foreground">({u.category})</span>
              </div>
              <span className="text-xs font-medium tabular-nums text-muted-foreground">{u.sqft.toLocaleString()} sqft</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
