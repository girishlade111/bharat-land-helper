import { useApp } from "@/context/AppContext";
import { CATEGORIES, type Category } from "@/data/units";
import { t } from "@/data/translations";
import { cn } from "@/lib/utils";

const SHOWN_TABS: Category[] = ["All", "Standard", "Maharashtra", "UP", "Bihar", "Punjab", "South"];

export default function FilterTabs() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {SHOWN_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={cn(
            "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            "min-h-[44px] min-w-[44px]",
            activeTab === tab
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
