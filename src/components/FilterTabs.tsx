import { useApp } from "@/context/AppContext";
import { CATEGORIES, type Category } from "@/data/units";
import { t } from "@/data/translations";
import { cn } from "@/lib/utils";

const SHOWN_TABS: Category[] = ["All", "Standard", "Maharashtra", "UP", "Bihar", "Punjab", "South"];

export default function FilterTabs() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {SHOWN_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
            "min-h-[36px] min-w-[36px] sm:min-h-[40px]",
            activeTab === tab
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
              : "bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
