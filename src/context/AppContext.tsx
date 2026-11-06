import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  ALL_REGIONS,
  ALL_UNITS,
  getRegion,
  getUnit,
  getUnitsForRegion,
  resolveUnit,
  convertArea,
  convertOneToAll,
  parseAreaInput,
  type Region,
  type LandUnit,
  type ConversionResult,
  type OneToAllResult,
  type ValidationResult,
  type ConversionContext,
  buildConversionSearchParams,
  getLegacyUnitInfo,
  parseCustomSnapshotParam,
  getEphemeralSnapshotUnit,
} from "@/core";
import { toast } from "@/hooks/use-toast";
import type { Lang } from "@/data/translations";

export interface ConversionStateUpdates {
  value?: string;
  fromUnitId?: string;
  toUnitId?: string;
  regionCode?: string;
}

export interface LegacyNotice {
  legacyUnitId: string;
  legacyName: string;
  legacySqFt: number;
  canonicalUnitId: string;
  canonicalName: string;
  canonicalSqFt: number;
  factorDiffers: boolean;
  notes: string;
}

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
  setConversionState: (updates: ConversionStateUpdates) => void;

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

  // Legacy notice and compatibility
  legacyNotice?: LegacyNotice | null;
  dismissLegacyNotice?: () => void;

  // Legacy compatibility helpers
  selectedState: string;
  setSelectedState: (stateName: string) => void;
  fromUnitId: string;
  stateCategory: string;
}

export interface AppProviderProps {
  children: React.ReactNode;
  initialRegionCode?: string;
  initialFromUnitId?: string;
  initialToUnitId?: string;
  initialInputValue?: string;
  initialLang?: Lang;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({
  children,
  initialRegionCode = "MH",
  initialFromUnitId = "acre",
  initialToUnitId = "guntha_mh",
  initialInputValue = "1",
  initialLang,
}: AppProviderProps) {
  const getInitialLang = useCallback((): Lang => {
    if (initialLang) return initialLang;
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p.startsWith("/hi")) return "hi";
      if (p.startsWith("/mr")) return "mr";
    }
    return "en";
  }, [initialLang]);

  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const [regionCode, setRegionCode] = useState<string>(initialRegionCode);
  const [fromUnitId, setFromUnitIdState] = useState<string>(initialFromUnitId);
  const [toUnitId, setToUnitIdState] = useState<string>(initialToUnitId);
  const [inputValue, setInputValueState] = useState<string>(initialInputValue);
  const [displayPrecision, setDisplayPrecision] = useState<number>(4);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [customUnitsVersion, setCustomUnitsVersion] = useState<number>(0);
  const [legacyNotice, setLegacyNotice] = useState<LegacyNotice | null>(null);

  const dismissLegacyNotice = useCallback(() => {
    setLegacyNotice(null);
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "bharat_custom_units_v1") {
        setCustomUnitsVersion((v) => v + 1);
      }
    };
    const handleCustomChange = () => setCustomUnitsVersion((v) => v + 1);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("bharat_custom_units_updated", handleCustomChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("bharat_custom_units_updated", handleCustomChange);
    };
  }, []);

  // Selected region
  const selectedRegion = useMemo(() => {
    return getRegion(regionCode) || ALL_REGIONS.find((r) => r.code === "MH")!;
  }, [regionCode]);

  // Available units for the region (Standard + Regional + Custom)
  const availableUnits = useMemo(() => {
    return getUnitsForRegion(selectedRegion.code);
  }, [selectedRegion.code, customUnitsVersion]);

  // From and To units
  const fromUnit = useMemo(() => {
    const candidate = getUnit(fromUnitId);
    if (candidate && (!fromUnitId.startsWith("custom_") || candidate.provenance.sourceName === "Shared Custom Unit Snapshot" || availableUnits.some((u) => u.id === fromUnitId))) {
      return candidate;
    }
    return ALL_UNITS.find((u) => u.id === "acre")!;
  }, [fromUnitId, availableUnits]);

  const toUnit = useMemo(() => {
    const candidate = getUnit(toUnitId);
    if (candidate && (!toUnitId.startsWith("custom_") || candidate.provenance.sourceName === "Shared Custom Unit Snapshot" || availableUnits.some((u) => u.id === toUnitId))) {
      return candidate;
    }
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

  // URL Query Parameters parsing helper
  const parseUrlParamsIntoState = useCallback(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("v");
      const from = params.get("from") || params.get("u");
      const to = params.get("to");
      const s = params.get("s");
      const l = params.get("lang");
      const varId = params.get("var");

      if (v && parseAreaInput(v).isValid) {
        setInputValueState(v);
      } else {
        setInputValueState(initialInputValue);
      }

      let activeRegionCode = initialRegionCode;
      if (s) {
        const found = getRegion(s);
        if (found) {
          activeRegionCode = found.code;
          setRegionCode(found.code);
        }
      } else {
        setRegionCode(initialRegionCode);
      }

      const context: ConversionContext = {
        stateCode: activeRegionCode,
        variantId: varId || undefined,
      };

      const fromSqFtParam = params.get("from_sqft") || params.get("c_from_sqft");
      const fromNameParam = params.get("from_name") || params.get("c_from_name");
      const toSqFtParam = params.get("to_sqft") || params.get("c_to_sqft");
      const toNameParam = params.get("to_name") || params.get("c_to_name");

      if (from) {
        let snapshotFrom: LandUnit | null = null;
        if (fromSqFtParam) {
          snapshotFrom = parseCustomSnapshotParam(fromSqFtParam, fromNameParam);
        }

        const legacyFrom = getLegacyUnitInfo(from);
        const resolvedFrom = snapshotFrom || resolveUnit(from, context);

        // Do not restore deleted custom units from URL unless a valid snapshot exists
        if (resolvedFrom && (!from.startsWith("custom_") || snapshotFrom || getUnit(from))) {
          setFromUnitIdState(resolvedFrom.id);
          if (legacyFrom && legacyFrom.factorDiffers) {
            setLegacyNotice({
              legacyUnitId: legacyFrom.legacyId,
              legacyName: legacyFrom.name,
              legacySqFt: legacyFrom.legacySqFt,
              canonicalUnitId: resolvedFrom.id,
              canonicalName: resolvedFrom.name,
              canonicalSqFt: resolvedFrom.sqFt,
              factorDiffers: true,
              notes: legacyFrom.notes,
            });
          }
        } else {
          setFromUnitIdState(initialFromUnitId);
          if (from.startsWith("custom_") || from === "custom") {
            setLegacyNotice({
              legacyUnitId: from,
              legacyName: fromNameParam || "Custom Unit",
              legacySqFt: 43560,
              canonicalUnitId: initialFromUnitId,
              canonicalName: "Acre",
              canonicalSqFt: 43560,
              factorDiffers: true,
              notes: "The shared custom unit preset was not found on this device and had no valid snapshot; defaulted safely to Acre.",
            });
          }
        }
      } else {
        setFromUnitIdState(initialFromUnitId);
      }

      if (to) {
        let snapshotTo: LandUnit | null = null;
        if (toSqFtParam) {
          snapshotTo = parseCustomSnapshotParam(toSqFtParam, toNameParam);
        }

        const legacyTo = getLegacyUnitInfo(to);
        const resolvedTo = snapshotTo || resolveUnit(to, context);

        // Do not restore deleted custom units from URL unless a valid snapshot exists
        if (resolvedTo && (!to.startsWith("custom_") || snapshotTo || getUnit(to))) {
          setToUnitIdState(resolvedTo.id);
          if (legacyTo && legacyTo.factorDiffers) {
            setLegacyNotice((prev) => prev || {
              legacyUnitId: legacyTo.legacyId,
              legacyName: legacyTo.name,
              legacySqFt: legacyTo.legacySqFt,
              canonicalUnitId: resolvedTo.id,
              canonicalName: resolvedTo.name,
              canonicalSqFt: resolvedTo.sqFt,
              factorDiffers: true,
              notes: legacyTo.notes,
            });
          }
        } else {
          setToUnitIdState(initialToUnitId);
          if (to.startsWith("custom_") || to === "custom") {
            setLegacyNotice((prev) => prev || {
              legacyUnitId: to,
              legacyName: toNameParam || "Custom Unit",
              legacySqFt: 43560,
              canonicalUnitId: initialToUnitId,
              canonicalName: "Acre",
              canonicalSqFt: 43560,
              factorDiffers: true,
              notes: "The shared custom unit preset was not found on this device and had no valid snapshot; defaulted safely to Acre.",
            });
          }
        }
      } else {
        setToUnitIdState(initialToUnitId);
      }

      if (snapshotFrom || snapshotTo) {
        setCustomUnitsVersion((v) => v + 1);
      }

      if (l === "hi" || l === "en" || l === "mr") {
        setLangState(l);
      } else {
        setLangState(getInitialLang());
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, [initialInputValue, initialRegionCode, initialFromUnitId, initialToUnitId, getInitialLang]);

  // Initial mount URL parse
  useEffect(() => {
    parseUrlParamsIntoState();
  }, [parseUrlParamsIntoState]);

  // Synchronize on browser Back / Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      parseUrlParamsIntoState();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [parseUrlParamsIntoState]);

  // Update browser URL query string relative to CURRENT route's initial conversion defaults
  const updateUrl = useCallback((val: string, fId: string, tId: string, rCode: string, lg: Lang) => {
    try {
      if (typeof window !== "undefined" && window.history?.replaceState) {
        const currentFrom = getUnit(fId);
        const currentTo = getUnit(tId);
        const isCustomFrom = currentFrom?.regionCode === "CUSTOM" || fId.startsWith("custom");
        const isCustomTo = currentTo?.regionCode === "CUSTOM" || tId.startsWith("custom");

        const newSearch = buildConversionSearchParams(
          {
            value: val,
            fromUnitId: fId,
            toUnitId: tId,
            regionCode: rCode,
            lang: lg,
            fromSqFt: isCustomFrom ? currentFrom?.sqFt : undefined,
            fromName: isCustomFrom ? currentFrom?.name?.replace(/\s*\(Custom.*?\)/, "").trim() : undefined,
            toSqFt: isCustomTo ? currentTo?.sqFt : undefined,
            toName: isCustomTo ? currentTo?.name?.replace(/\s*\(Custom.*?\)/, "").trim() : undefined,
          },
          window.location.search,
          {
            defaultValue: initialInputValue,
            defaultFromUnitId: initialFromUnitId,
            defaultToUnitId: initialToUnitId,
            defaultRegionCode: initialRegionCode,
            defaultLang: getInitialLang(),
          }
        );

        const newUrl = newSearch ? `${window.location.pathname}${newSearch}` : window.location.pathname;
        const currentSearch = window.location.search || "";
        const targetSearch = newSearch;
        if (currentSearch !== targetSearch) {
          window.history.replaceState(null, "", newUrl);
        }
      }
    } catch {
      // Ignore
    }
  }, [initialInputValue, initialFromUnitId, initialToUnitId, initialRegionCode, getInitialLang]);

  // Atomic conversion state and URL updater to eliminate stale URL parameters and transition races
  const setConversionState = useCallback((updates: ConversionStateUpdates) => {
    const nextValue = updates.value !== undefined ? updates.value : inputValue;
    const nextRegion = updates.regionCode !== undefined ? updates.regionCode : regionCode;
    let nextFrom = updates.fromUnitId !== undefined ? updates.fromUnitId : fromUnitId;
    let nextTo = updates.toUnitId !== undefined ? updates.toUnitId : toUnitId;

    // If region changed and units were NOT explicitly provided, apply safe transitions
    if (updates.regionCode !== undefined && updates.regionCode !== regionCode) {
      const regionUnits = getUnitsForRegion(nextRegion);

      if (updates.fromUnitId === undefined) {
        const currentFrom = getUnit(nextFrom);
        if (currentFrom?.category === "regional" && !regionUnits.some((u) => u.id === currentFrom.id)) {
          nextFrom = "acre";
        }
      }

      if (updates.toUnitId === undefined) {
        const currentTo = getUnit(nextTo);
        if (currentTo?.category === "regional" && !regionUnits.some((u) => u.id === currentTo.id)) {
          const firstRegional = regionUnits.find((u) => u.category === "regional");
          nextTo = firstRegional ? firstRegional.id : "sqft";
        }
      }

      if (nextFrom === nextTo) {
        nextTo = nextFrom === "acre" ? "sqft" : "acre";
      }
    }

    if (updates.value !== undefined) setInputValueState(nextValue);
    if (updates.regionCode !== undefined) setRegionCode(nextRegion);
    if (updates.fromUnitId !== undefined || nextFrom !== fromUnitId) setFromUnitIdState(nextFrom);
    if (updates.toUnitId !== undefined || nextTo !== toUnitId) setToUnitIdState(nextTo);

    updateUrl(nextValue, nextFrom, nextTo, nextRegion, lang);
  }, [inputValue, fromUnitId, toUnitId, regionCode, lang, updateUrl]);

  const setInputValue = useCallback((val: string) => {
    setConversionState({ value: val });
  }, [setConversionState]);

  const setFromUnitId = useCallback((id: string) => {
    setConversionState({ fromUnitId: id });
  }, [setConversionState]);

  const setToUnitId = useCallback((id: string) => {
    setConversionState({ toUnitId: id });
  }, [setConversionState]);

  const swapUnits = useCallback(() => {
    setConversionState({
      fromUnitId: toUnit.id,
      toUnitId: fromUnit.id,
    });
  }, [toUnit.id, fromUnit.id, setConversionState]);

  const setSelectedRegionCode = useCallback((code: string) => {
    setConversionState({ regionCode: code });
  }, [setConversionState]);

  const setSelectedState = useCallback((stateName: string) => {
    const r = getRegion(stateName);
    if (r) {
      setSelectedRegionCode(r.code);
    }
  }, [setSelectedRegionCode]);

  // Safely recover if an active custom source or target unit is deleted
  useEffect(() => {
    let stateChanged = false;
    let nextFrom = fromUnitId;
    let nextTo = toUnitId;

    if (fromUnitId.startsWith("custom_") || fromUnitId.startsWith("custom-")) {
      const isSnapshot = !!getEphemeralSnapshotUnit(fromUnitId);
      const exists = isSnapshot || availableUnits.some((u) => u.id === fromUnitId);
      if (!exists) {
        nextFrom = "acre";
        setFromUnitIdState("acre");
        stateChanged = true;
      }
    }

    if (toUnitId.startsWith("custom_") || toUnitId.startsWith("custom-")) {
      const isSnapshot = !!getEphemeralSnapshotUnit(toUnitId);
      const exists = isSnapshot || availableUnits.some((u) => u.id === toUnitId);
      if (!exists) {
        const regional = availableUnits.find((u) => u.category === "regional");
        nextTo = regional ? regional.id : "sqft";
        setToUnitIdState(nextTo);
        stateChanged = true;
      }
    }

    if (stateChanged) {
      updateUrl(inputValue, nextFrom, nextTo, regionCode, lang);
      try {
        toast({
          title: lang === "hi" ? "कस्टम इकाई उपलब्ध नहीं" : "Custom Unit Removed",
          description:
            lang === "hi"
              ? "हटाए गए कस्टम माप को सुरक्षित मानक इकाई में पुनर्स्थापित किया गया।"
              : "Deleted custom unit factor was recovered to safe standard unit.",
          variant: "destructive",
        });
      } catch {
        // Ignore in environments without toast provider
      }
    }
  }, [availableUnits, fromUnitId, toUnitId, inputValue, regionCode, lang, updateUrl]);

  const setLang = useCallback((lg: Lang) => {
    setLangState(lg);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lg;
    }
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
    setConversionState,
    inputValue,
    setInputValue,
    validation,
    displayPrecision,
    setDisplayPrecision,
    activeTab,
    setActiveTab,
    primaryResult,
    oneToAllResult,
    legacyNotice,
    dismissLegacyNotice,
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
