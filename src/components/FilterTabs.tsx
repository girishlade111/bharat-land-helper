import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "All", label: "All Units", labelHi: "सभी इकाइयाँ" },
  { id: "Standard", label: "Standard & Metric", labelHi: "मानक व मीट्रिक" },
  { id: "Regional", label: "State Regional Units", labelHi: "राज्य क्षेत्रीय इकाइयाँ" },
];

export default function FilterTabs() {
  const { activeTab, setActiveTab, lang, selectedRegion } = useApp();

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Unit filter tabs">
      {TABS.map((tab) => {
        const isSelected = activeTab === tab.id;
        const displayLabel =
          tab.id === "Regional"
            ? lang === "hi"
              ? `${selectedRegion.nameHi} इकाइयाँ`
              : `${selectedRegion.name} Units`
            : lang === "hi"
            ? tab.labelHi
            : tab.label;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "min-h-[38px] active:scale-95",
              isSelected
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {displayLabel}
          </button>
        );
      })}
    </div>
  );
}
