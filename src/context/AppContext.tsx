import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UNITS, STATES, STATE_TO_CATEGORY, type Category } from "@/data/units";
import type { Lang } from "@/data/translations";

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  selectedState: string;
  setSelectedState: (s: string) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  fromUnitId: string;
  setFromUnitId: (id: string) => void;
  activeTab: Category;
  setActiveTab: (c: Category) => void;
  stateCategory: Category;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [selectedState, setSelectedState] = useState("Maharashtra");
  const [inputValue, setInputValue] = useState("1000");
  const [fromUnitId, setFromUnitId] = useState("sqft");
  const [activeTab, setActiveTab] = useState<Category>("All");

  const stateCategory = STATE_TO_CATEGORY[selectedState] || "Standard";

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("v");
    const u = params.get("u");
    const s = params.get("s");
    if (v) setInputValue(v);
    if (u && UNITS.find((unit) => unit.id === u)) setFromUnitId(u);
    if (s && STATES.includes(s)) setSelectedState(s);
  }, []);

  return (
    <AppContext.Provider value={{
      lang, setLang, selectedState, setSelectedState,
      inputValue, setInputValue, fromUnitId, setFromUnitId,
      activeTab, setActiveTab, stateCategory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
