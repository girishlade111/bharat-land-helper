import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  ALL_REGIONS,
  ALL_UNITS,
  getRegion,
  getUnit,
  getUnitsForRegion,
  convertArea,
  convertOneToAll,
  parseAreaInput,
  type Region,
  type LandUnit,
  type ConversionResult,
  type OneToAllResult,
  type ValidationResult,
} from "@/core";
import type { Lang } from "@/data/translations";

export interface AppContextType {
  // Localization
  lang: Lang;
  setLang: (lang: Lang) => void;

  // Region
  selectedRegion: Region;
  setSelectedRegionCode: (code: string) => void;
  availableRegions: Region[];

  // Units
  availableUnits: LandUnit[];
  fromUnit: LandUnit;
  toUnit: LandUnit;
  setFromUnitId: (id: string) => void;
  setToUnitId: (id: string) => void;
  swapUnits: () => void;

  // Input & Validation
  inputValue: string;
  setInputValue: (val: string) => void;
  validation: ValidationResult;

  // Precision & Mode
  displayPrecision: number;
  setDisplayPrecision: (precision: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Calculated Results
  primaryResult: ConversionResult | null;
  oneToAllResult: OneToAllResult;

  // Legacy compatibility helpers
  selectedState: string;
  setSelectedState: (stateName: string) => void;
  fromUnitId: string;
  stateCategory: string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [regionCode, setRegionCode] = useState<string>("MH"); // Default Maharashtra
  const [fromUnitId, setFromUnitIdState] = useState<string>("acre");
  const [toUnitId, setToUnitIdState] = useState<string>("guntha_mh");
  const [inputValue, setInputValueState] = useState<string>("1");
  const [displayPrecision, setDisplayPrecision] = useState<number>(4);
  const [activeTab, setActiveTab] = useState<string>("All");

  // Selected region
  const selectedRegion = useMemo(() => {
    return getRegion(regionCode) || ALL_REGIONS.find((r) => r.code === "MH")!;
  }, [regionCode]);

  // Available units for the region (Standard + Regional)
  const availableUnits = useMemo(() => {
    return getUnitsForRegion(selectedRegion.code);
  }, [selectedRegion.code]);

  // From and To units
  const fromUnit = useMemo(() => {
    return getUnit(fromUnitId) || ALL_UNITS.find((u) => u.id === "acre")!;
  }, [fromUnitId]);

  const toUnit = useMemo(() => {
    const candidate = getUnit(toUnitId);
    if (candidate) return candidate;
    // Default to the first regional unit, or sqft
    const regional = availableUnits.find((u) => u.category === "regional");
    return regional || ALL_UNITS.find((u) => u.id === "sqft")!;
  }, [toUnitId, availableUnits]);

  // Validation
  const validation = useMemo<ValidationResult>(() => {
    const parsed = parseAreaInput(inputValue);
    return {
      isValid: parsed.isValid,
      parsedValue: parsed.value,
      errorMessage: parsed.errorMessage,
      errorMessageHi: parsed.errorMessageHi,
    };
  }, [inputValue]);

  // Primary Conversion (From -> To)
  const primaryResult = useMemo<ConversionResult | null>(() => {
    if (!validation.isValid) return null;
    try {
      return convertArea(validation.parsedValue, fromUnit, toUnit, displayPrecision);
    } catch {
      return null;
    }
  }, [validation, fromUnit, toUnit, displayPrecision]);

  // One to All Conversion
  const oneToAllResult = useMemo<OneToAllResult>(() => {
    const val = validation.isValid ? validation.parsedValue : 0;
    return convertOneToAll(val, fromUnit, availableUnits, displayPrecision);
  }, [validation, fromUnit, availableUnits, displayPrecision]);

  // URL Query Parameters on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("v");
      const from = params.get("from") || params.get("u");
      const to = params.get("to");
      const s = params.get("s");
      const l = params.get("lang");

      if (v && parseAreaInput(v).isValid) {
        setInputValueState(v);
      }
      if (s) {
        const found = getRegion(s);
        if (found) setRegionCode(found.code);
      }
      if (from && getUnit(from)) {
        setFromUnitIdState(from);
      }
      if (to && getUnit(to)) {
        setToUnitIdState(to);
      }
      if (l === "hi" || l === "en") {
        setLangState(l);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // Update browser URL query string on state changes without reloading
  const updateUrl = useCallback((val: string, fId: string, tId: string, rCode: string, lg: Lang) => {
    try {
      if (typeof window !== "undefined" && window.history?.replaceState) {
        const params = new URLSearchParams();
        if (val && val !== "1") params.set("v", val);
        if (fId && fId !== "acre") params.set("from", fId);
        if (tId && tId !== "guntha_mh") params.set("to", tId);
        if (rCode && rCode !== "MH") params.set("s", rCode);
        if (lg && lg !== "en") params.set("lang", lg);

        const newSearch = params.toString();
        const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;
        window.history.replaceState(null, "", newUrl);
      }
    } catch {
      // Ignore
    }
  }, []);

  const setInputValue = useCallback((val: string) => {
    setInputValueState(val);
    updateUrl(val, fromUnitId, toUnitId, regionCode, lang);
  }, [fromUnitId, toUnitId, regionCode, lang, updateUrl]);

  const setFromUnitId = useCallback((id: string) => {
    setFromUnitIdState(id);
    updateUrl(inputValue, id, toUnitId, regionCode, lang);
  }, [inputValue, toUnitId, regionCode, lang, updateUrl]);

  const setToUnitId = useCallback((id: string) => {
    setToUnitIdState(id);
    updateUrl(inputValue, fromUnitId, id, regionCode, lang);
  }, [inputValue, fromUnitId, regionCode, lang, updateUrl]);

  const swapUnits = useCallback(() => {
    setFromUnitIdState(toUnit.id);
    setToUnitIdState(fromUnit.id);
    updateUrl(inputValue, toUnit.id, fromUnit.id, regionCode, lang);
  }, [fromUnit.id, toUnit.id, inputValue, regionCode, lang, updateUrl]);

  const setSelectedRegionCode = useCallback((code: string) => {
    setRegionCode(code);
    const regionUnits = getUnitsForRegion(code);
    // If toUnit is regional and not in the new region, update it
    if (toUnit.category === "regional" && !regionUnits.some((u) => u.id === toUnit.id)) {
      const firstRegional = regionUnits.find((u) => u.category === "regional");
      const nextTo = firstRegional ? firstRegional.id : "sqft";
      setToUnitIdState(nextTo);
      updateUrl(inputValue, fromUnitId, nextTo, code, lang);
    } else {
      updateUrl(inputValue, fromUnitId, toUnitId, code, lang);
    }
  }, [toUnit, inputValue, fromUnitId, toUnitId, lang, updateUrl]);

  const setSelectedState = useCallback((stateName: string) => {
    const r = getRegion(stateName);
    if (r) {
      setSelectedRegionCode(r.code);
    }
  }, [setSelectedRegionCode]);

  const setLang = useCallback((lg: Lang) => {
    setLangState(lg);
    updateUrl(inputValue, fromUnitId, toUnitId, regionCode, lg);
  }, [inputValue, fromUnitId, toUnitId, regionCode, updateUrl]);

  const contextValue: AppContextType = {
    lang,
    setLang,
    selectedRegion,
    setSelectedRegionCode,
    availableRegions: ALL_REGIONS,
    availableUnits,
    fromUnit,
    toUnit,
    setFromUnitId,
    setToUnitId,
    swapUnits,
    inputValue,
    setInputValue,
    validation,
    displayPrecision,
    setDisplayPrecision,
    activeTab,
    setActiveTab,
    primaryResult,
    oneToAllResult,
    // Legacy support
    selectedState: selectedRegion.name,
    setSelectedState,
    fromUnitId: fromUnit.id,
    stateCategory: selectedRegion.name,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
