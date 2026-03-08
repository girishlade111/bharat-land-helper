import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { UNITS } from "@/data/units";
import { t } from "@/data/translations";
import { Input } from "@/components/ui/input";

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
    <div className="rounded-lg border bg-card p-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchUnit", lang)}
        className="min-h-[44px]"
      />
      {results.length > 0 && (
        <div className="mt-3 space-y-2">
          {results.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2 text-sm">
              <div>
                <span className="font-medium">{lang === "hi" ? u.nameHi : u.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">({u.category})</span>
              </div>
              <span className="text-xs text-muted-foreground">{u.sqft.toLocaleString()} sqft</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
