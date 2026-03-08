import { useApp } from "@/context/AppContext";
import { UNITS, CATEGORIES, STATE_TO_CATEGORY } from "@/data/units";
import { t } from "@/data/translations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";

export default function ConverterInput() {
  const { lang, inputValue, setInputValue, fromUnitId, setFromUnitId, selectedState, stateCategory } = useApp();

  // Group units by category, prioritizing selected state's category
  const grouped: Record<string, typeof UNITS> = {};
  for (const u of UNITS) {
    if (!grouped[u.category]) grouped[u.category] = [];
    grouped[u.category].push(u);
  }

  // Sort categories: state category first, then Standard, then rest
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    if (a === stateCategory) return -1;
    if (b === stateCategory) return 1;
    if (a === "Standard") return -1;
    if (b === "Standard") return 1;
    return 0;
  });

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            {t("enterValue", lang)}
          </label>
          <Input
            type="number"
            inputMode="decimal"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="1000"
            className="h-14 text-2xl font-bold"
            min="0"
            step="any"
          />
        </div>
        <div className="w-full sm:w-[220px]">
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            {t("fromUnit", lang)}
          </label>
          <Select value={fromUnitId} onValueChange={setFromUnitId}>
            <SelectTrigger className="h-14 text-base font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {sortedCategories.map((cat) => (
                <SelectGroup key={cat}>
                  <SelectLabel className="text-xs font-semibold text-primary">{cat}</SelectLabel>
                  {grouped[cat].map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {lang === "hi" ? u.nameHi : u.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
