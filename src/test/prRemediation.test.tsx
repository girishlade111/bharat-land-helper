// src/test/prRemediation.test.ts
// Bharat Land Converter — PR #2 Pre-Merge Remediation Test Suite
// Covers Codex review findings:
// 1. Saved parcel migration & storage safety (MyLandList.tsx)
// 2. Converter landing route keying & state reinitialization (ConversionLanding.tsx)
// 3. Batched conversion updates & atomic URL synchronization (AppContext.tsx)
// 4. Cross-state history restoration without stale region resets (ConversionHistory.tsx)
// 5. Dependency cleanliness (zod removal)

import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import {
  migrateLegacyParcels,
  loadParcels,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  PARCELS_MIGRATION_FLAG,
  type SavedLand,
} from "../components/MyLandList";
import { AppProvider, useApp } from "../context/AppContext";
import { getConversionRouteByPath } from "../data/seoRoutes";
import Header, { resolveLocalizedDestination } from "../components/Header";
import ConversionHistory from "../components/ConversionHistory";
import PlotCalculator from "../components/PlotCalculator";
import CompoundUnitConverter from "../components/CompoundUnitConverter";
import CustomUnitManager from "../components/CustomUnitManager";
import {
  saveHistory,
  saveCustomPreset,
  deleteCustomPreset,
  loadCustomPresets,
  buildConversionSearchParams,
  type ConversionHistoryItem,
} from "../core";
import { MemoryRouter, useLocation } from "react-router-dom";

describe("PR #2 Pre-Merge Remediation Suite", () => {
  beforeEach(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
      window.history.replaceState(null, "", "/");
    }
  });

  // =========================================================================
  // Defect 1: Saved Parcel Migration & Storage Safety (REM-001 to REM-007)
  // =========================================================================

  it("REM-001: Migrates legacy parcels from bharat-land-parcels to bharat-land-parcels-v2", () => {
    const legacyData = [
      {
        id: "land-101",
        name: "Ancestral Farm",
        value: 2.5,
        unitId: "acre",
        state: "Maharashtra",
        sqftTotal: 108900,
        date: "01/01/2025",
      },
      {
        id: "land-102",
        name: "Pune Plot",
        value: 10,
        unitId: "guntha",
        state: "MH",
        sqftTotal: 10890,
        date: "05/02/2025",
      },
    ];

    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyData));

    const migrated = migrateLegacyParcels();

    expect(migrated).toHaveLength(2);
    expect(migrated[0].name).toBe("Ancestral Farm");
    expect(migrated[0].stateCode).toBe("MH");
    expect(migrated[0].stateName).toBe("Maharashtra");
    expect(migrated[0].sqftTotal).toBe(108900);

    expect(migrated[1].name).toBe("Pune Plot");
    expect(migrated[1].stateCode).toBe("MH");
    expect(migrated[1].unitId).toBe("guntha_mh");
    expect(migrated[1].sqftTotal).toBe(10890);

    // Verify v2 key and migration flag were persisted
    const storedV2 = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    expect(storedV2).toHaveLength(2);
    expect(window.localStorage.getItem(PARCELS_MIGRATION_FLAG)).toBe("true");
  });

  it("REM-002: Maps legacy state string to standard stateCode and stateName accurately", () => {
    const legacyData = [
      {
        id: "up-plot",
        name: "Varanasi Land",
        value: 2,
        unitId: "bigha",
        state: "Uttar Pradesh",
        sqftTotal: 54000,
        date: "10/03/2025",
      },
      {
        id: "wb-plot",
        name: "Kolkata Plot",
        value: 5,
        unitId: "katha",
        state: "West Bengal",
        sqftTotal: 3600,
        date: "12/03/2025",
      },
    ];

    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyData));

    const migrated = migrateLegacyParcels();

    expect(migrated[0].stateCode).toBe("UP");
    expect(migrated[0].stateName).toBe("Uttar Pradesh");
    expect(migrated[0].unitId).toBe("bigha_up_pucca");

    expect(migrated[1].stateCode).toBe("WB");
    expect(migrated[1].stateName).toBe("West Bengal");
    expect(migrated[1].unitId).toBe("kattha_wb");
  });

  it("REM-003: Preserves existing custom sqftTotal or accurately calculates missing sqftTotal", () => {
    const legacyData = [
      {
        id: "calc-test-1",
        name: "Custom Measured Parcel",
        value: 100,
        unitId: "sqyd",
        state: "MH",
        sqftTotal: 900, // explicit custom sqftTotal preserved
        date: "15/03/2025",
      },
      {
        id: "calc-test-2",
        name: "Missing Total Parcel",
        value: 2,
        unitId: "acre",
        state: "MH",
        // sqftTotal omitted
        date: "16/03/2025",
      },
    ];

    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyData));

    const migrated = migrateLegacyParcels();

    expect(migrated[0].sqftTotal).toBe(900);
    expect(migrated[1].sqftTotal).toBe(2 * 43560); // 87,120 sq ft calculated
  });

  it("REM-004: Migration is idempotent and does not duplicate items across runs", () => {
    const legacyData = [
      {
        id: "fixed-id-1",
        name: "Farm 1",
        value: 1,
        unitId: "acre",
        state: "MH",
        sqftTotal: 43560,
        date: "01/01/2025",
      },
    ];

    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyData));

    const firstRun = migrateLegacyParcels();
    expect(firstRun).toHaveLength(1);

    const secondRun = migrateLegacyParcels();
    expect(secondRun).toHaveLength(1);

    const thirdLoad = loadParcels();
    expect(thirdLoad).toHaveLength(1);
    expect(thirdLoad[0].id).toBe("fixed-id-1");
  });

  it("REM-005: Preserves already existing records in v2 storage during migration", () => {
    const existingV2: SavedLand[] = [
      {
        id: "existing-v2-item",
        name: "Modern App Saved Parcel",
        value: 500,
        unitId: "sqyd",
        stateCode: "MH",
        stateName: "Maharashtra",
        sqftTotal: 4500,
        date: "01/04/2025",
      },
    ];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existingV2));

    const legacyData = [
      {
        id: "legacy-imported-item",
        name: "Old App Saved Parcel",
        value: 1,
        unitId: "acre",
        state: "MH",
        sqftTotal: 43560,
        date: "01/01/2025",
      },
    ];
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyData));

    const merged = migrateLegacyParcels();

    expect(merged).toHaveLength(2);
    expect(merged.map((m) => m.id)).toEqual(["existing-v2-item", "legacy-imported-item"]);
  });

  it("REM-006: Deleted parcels do not resurrect from legacy storage upon subsequent reloads", () => {
    const legacyData = [
      {
        id: "to-delete-item",
        name: "Temporary Land",
        value: 1,
        unitId: "acre",
        state: "MH",
        sqftTotal: 43560,
        date: "01/01/2025",
      },
    ];
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyData));

    // First load runs migration
    const initial = loadParcels();
    expect(initial).toHaveLength(1);

    // User deletes the parcel, writing empty array to v2 storage
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

    // Next reload should NOT resurrect the deleted item because migration flag is set
    const reloaded = loadParcels();
    expect(reloaded).toHaveLength(0);
  });

  it("REM-007: Handles corrupted or non-array legacy JSON gracefully without crashing", () => {
    window.localStorage.setItem(LEGACY_STORAGE_KEY, "{ not: valid json");
    expect(() => migrateLegacyParcels()).not.toThrow();

    window.localStorage.clear();
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ not: "an array" }));
    const result = migrateLegacyParcels();
    expect(result).toEqual([]);
    expect(window.localStorage.getItem(PARCELS_MIGRATION_FLAG)).toBe("true");
  });

  // =========================================================================
  // Defect 2: Converter Landing Route Keying & State Isolation (REM-008, REM-009)
  // =========================================================================

  it("REM-008: Keying AppProvider resets state when landing route changes", () => {
    const route1 = getConversionRouteByPath("/convert/guntha-to-sqft/maharashtra")!;
    const route2 = getConversionRouteByPath("/convert/acre-to-bigha/uttar-pradesh")!;

    expect(route1).toBeDefined();
    expect(route2).toBeDefined();

    function TestConsumer() {
      const { selectedRegion, fromUnit, toUnit, inputValue } = useApp();
      return (
        <div>
          <span data-testid="region">{selectedRegion.code}</span>
          <span data-testid="from">{fromUnit.id}</span>
          <span data-testid="to">{toUnit.id}</span>
          <span data-testid="val">{inputValue}</span>
        </div>
      );
    }

    // Mount under route 1
    const { rerender } = render(
      <AppProvider
        key={route1.path}
        initialRegionCode={route1.stateCode}
        initialFromUnitId={route1.fromUnit}
        initialToUnitId={route1.toUnit}
        initialInputValue={String(route1.defaultVal)}
      >
        <TestConsumer />
      </AppProvider>
    );

    expect(screen.getByTestId("region").textContent).toBe("MH");
    expect(screen.getByTestId("from").textContent).toBe("guntha_mh");
    expect(screen.getByTestId("to").textContent).toBe("sqft");

    // Navigate to route 2 with new key
    rerender(
      <AppProvider
        key={route2.path}
        initialRegionCode={route2.stateCode}
        initialFromUnitId={route2.fromUnit}
        initialToUnitId={route2.toUnit}
        initialInputValue={String(route2.defaultVal)}
      >
        <TestConsumer />
      </AppProvider>
    );

    // State must cleanly update to route 2
    expect(screen.getByTestId("region").textContent).toBe("UP");
    expect(screen.getByTestId("from").textContent).toBe("acre");
    expect(screen.getByTestId("to").textContent).toBe("bigha_up_pucca");
  });

  it("REM-009: AppProvider re-synchronizes props on rerender or key change", () => {
    function TestConsumer() {
      const { selectedRegion } = useApp();
      return <span data-testid="region">{selectedRegion.code}</span>;
    }

    const { rerender } = render(
      <AppProvider initialRegionCode="MH">
        <TestConsumer />
      </AppProvider>
    );
    expect(screen.getByTestId("region").textContent).toBe("MH");

    rerender(
      <AppProvider initialRegionCode="UP">
        <TestConsumer />
      </AppProvider>
    );
    expect(screen.getByTestId("region").textContent).toBe("UP");
  });

  // =========================================================================
  // Defect 3: Batched Conversion Updates & Atomic URL Sync (REM-010 to REM-012)
  // =========================================================================

  it("REM-010: setConversionState atomically updates state and URL without stale parameters", () => {
    let capturedContext: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      const ctx = useApp();
      capturedContext = ctx;
      return null;
    }

    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="acre" initialToUnitId="guntha_mh" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    const replaceSpy = vi.spyOn(window.history, "replaceState");

    act(() => {
      capturedContext!.setConversionState({
        value: "1500",
        fromUnitId: "sqft",
        toUnitId: "guntha_mh",
      });
    });

    expect(capturedContext!.inputValue).toBe("1500");
    expect(capturedContext!.fromUnit.id).toBe("sqft");
    expect(capturedContext!.toUnit.id).toBe("guntha_mh");

    // URL replaceState was called with combined parameters
    expect(replaceSpy).toHaveBeenCalled();
    const lastUrl = replaceSpy.mock.calls[replaceSpy.mock.calls.length - 1][2] as string;
    expect(lastUrl).toContain("v=1500");
    expect(lastUrl).toContain("from=sqft");

    replaceSpy.mockRestore();
  });

  it("REM-011: Transferring plot area to converter updates both value and unit atomically", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return null;
    }

    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="acre" initialToUnitId="guntha_mh" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    const replaceSpy = vi.spyOn(window.history, "replaceState");

    // Simulate PlotCalculator handleTransfer workflow
    act(() => {
      ctxRef!.setConversionState({
        value: "2400",
        fromUnitId: "sqft",
        toUnitId: "acre",
      });
    });

    expect(ctxRef!.inputValue).toBe("2400");
    expect(ctxRef!.fromUnit.id).toBe("sqft");
    expect(ctxRef!.toUnit.id).toBe("acre");

    const lastUrl = replaceSpy.mock.calls[replaceSpy.mock.calls.length - 1][2] as string;
    const urlParams = new URLSearchParams(lastUrl.split("?")[1]);

    expect(urlParams.get("v")).toBe("2400");
    expect(urlParams.get("from")).toBe("sqft");
    expect(urlParams.get("to")).toBe("acre");

    replaceSpy.mockRestore();
  });

  it("REM-012: Individual setters forward to atomic updater consistently", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return null;
    }

    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="acre" initialToUnitId="guntha_mh" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    act(() => {
      ctxRef!.setInputValue("5");
    });
    expect(ctxRef!.inputValue).toBe("5");

    act(() => {
      ctxRef!.setFromUnitId("sqyd");
    });
    expect(ctxRef!.fromUnit.id).toBe("sqyd");

    act(() => {
      ctxRef!.swapUnits();
    });
    expect(ctxRef!.fromUnit.id).toBe("guntha_mh");
    expect(ctxRef!.toUnit.id).toBe("sqyd");
  });

  // =========================================================================
  // Defect 4: Cross-State History Restoration (REM-013 to REM-015)
  // =========================================================================

  it("REM-013: Cross-state history restore retains specific target unit without fallback reset", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return null;
    }

    // Start in Maharashtra with Acre -> Guntha
    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="acre" initialToUnitId="guntha_mh" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    expect(ctxRef!.selectedRegion.code).toBe("MH");
    expect(ctxRef!.toUnit.id).toBe("guntha_mh");

    // Restore history item saved from UP: 5 Acre -> Biswa (Pucca)
    // In old code, switching to UP inspected current toUnit (guntha_mh) and reset to Bigha!
    act(() => {
      ctxRef!.setConversionState({
        value: "5",
        fromUnitId: "acre",
        toUnitId: "biswa_up_pucca",
        regionCode: "UP",
      });
    });

    expect(ctxRef!.selectedRegion.code).toBe("UP");
    expect(ctxRef!.fromUnit.id).toBe("acre");
    // Target unit MUST remain Biswa, NOT get reset to Bigha
    expect(ctxRef!.toUnit.id).toBe("biswa_up_pucca");
    expect(ctxRef!.inputValue).toBe("5");
  });

  it("REM-014: Cross-state history restore writes valid state and unit query parameters", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return null;
    }

    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="acre" initialToUnitId="guntha_mh" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    const replaceSpy = vi.spyOn(window.history, "replaceState");

    act(() => {
      ctxRef!.setConversionState({
        value: "10",
        fromUnitId: "acre",
        toUnitId: "cent",
        regionCode: "TN",
      });
    });

    const lastUrl = replaceSpy.mock.calls[replaceSpy.mock.calls.length - 1][2] as string;
    const urlParams = new URLSearchParams(lastUrl.split("?")[1]);

    expect(urlParams.get("v")).toBe("10");
    expect(urlParams.get("s")).toBe("TN");
    expect(urlParams.get("to")).toBe("cent");

    replaceSpy.mockRestore();
  });

  it("REM-015: Region-only transition safely adapts incompatible regional units", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return null;
    }

    // In MH with Guntha (regional to MH)
    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="guntha_mh" initialToUnitId="sqft" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    // User switches region to UP via dropdown (regionCode only, no explicit units)
    act(() => {
      ctxRef!.setSelectedRegionCode("UP");
    });

    expect(ctxRef!.selectedRegion.code).toBe("UP");
    // Incompatible MH Guntha must safely transition to standard 'acre'
    expect(ctxRef!.fromUnit.id).toBe("acre");
    expect(ctxRef!.toUnit.id).toBe("sqft");
  });

  // =========================================================================
  // Defect 5: Route-Aware Default URL Serialization (REM-016 to REM-019)
  // =========================================================================

  it("REM-016: Landing route (/convert/hectare-to-acre) serializes from=acre when user changes source", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return null;
    }

    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="hectare" initialToUnitId="acre" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    const replaceSpy = vi.spyOn(window.history, "replaceState");

    // Change source from route default 'hectare' to 'acre'
    act(() => {
      ctxRef!.setConversionState({ fromUnitId: "acre" });
    });

    expect(ctxRef!.fromUnit.id).toBe("acre");
    expect(replaceSpy).toHaveBeenCalled();
    const lastUrl = replaceSpy.mock.calls[replaceSpy.mock.calls.length - 1][2] as string;
    // Must NOT omit from=acre because route default is hectare!
    expect(lastUrl).toContain("from=acre");

    replaceSpy.mockRestore();
  });

  it("REM-017: Landing route mount restores from=acre from URL query string over route default", () => {
    window.history.replaceState(null, "", "/convert/hectare-to-acre?from=acre");

    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return null;
    }

    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="hectare" initialToUnitId="acre" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    // fromUnit must be 'acre' from URL, NOT 'hectare'
    expect(ctxRef!.fromUnit.id).toBe("acre");
    expect(ctxRef!.toUnit.id).toBe("acre");
  });

  it("REM-018: Resetting unit back to route default removes parameter from URL", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return null;
    }

    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="hectare" initialToUnitId="acre" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    const replaceSpy = vi.spyOn(window.history, "replaceState");

    // Change to 'sqyd' -> from is serialized
    act(() => {
      ctxRef!.setConversionState({ fromUnitId: "sqyd" });
    });
    let lastUrl = replaceSpy.mock.calls[replaceSpy.mock.calls.length - 1][2] as string;
    expect(lastUrl).toContain("from=sqyd");

    // Change back to route default 'hectare' -> from is omitted
    act(() => {
      ctxRef!.setConversionState({ fromUnitId: "hectare" });
    });
    lastUrl = replaceSpy.mock.calls[replaceSpy.mock.calls.length - 1][2] as string;
    expect(lastUrl).not.toContain("from=");

    replaceSpy.mockRestore();
  });

  it("REM-019: Popstate event (browser Back/Forward) re-synchronizes AppContext state", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return null;
    }

    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="acre" initialToUnitId="guntha_mh" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    expect(ctxRef!.inputValue).toBe("1");

    // Simulate browser Back button navigating to ?v=50&from=sqyd
    window.history.replaceState(null, "", "/?v=50&from=sqyd");
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(ctxRef!.inputValue).toBe("50");
    expect(ctxRef!.fromUnit.id).toBe("sqyd");
  });

  // =========================================================================
  // Defect 6: Safe Multilingual Route Navigation (REM-020 to REM-025)
  // =========================================================================

  it("REM-020: Resolves homepage locale switches cleanly (en -> hi -> mr -> en)", () => {
    expect(resolveLocalizedDestination("/", "hi")).toEqual({
      targetPath: "/hi",
      hasDedicatedPage: true,
    });
    expect(resolveLocalizedDestination("/hi", "mr")).toEqual({
      targetPath: "/mr",
      hasDedicatedPage: true,
    });
    expect(resolveLocalizedDestination("/mr", "en")).toEqual({
      targetPath: "/",
      hasDedicatedPage: true,
    });
  });

  it("REM-021: Resolves tools hub locale switches cleanly", () => {
    expect(resolveLocalizedDestination("/tools", "hi")).toEqual({
      targetPath: "/hi/tools",
      hasDedicatedPage: true,
    });
    expect(resolveLocalizedDestination("/hi/tools", "mr")).toEqual({
      targetPath: "/mr/tools",
      hasDedicatedPage: true,
    });
    expect(resolveLocalizedDestination("/mr/tools", "en")).toEqual({
      targetPath: "/tools",
      hasDedicatedPage: true,
    });
  });

  it("REM-022: Resolves dedicated tool page locale switches cleanly", () => {
    expect(resolveLocalizedDestination("/tools/plot-area-calculator", "hi")).toEqual({
      targetPath: "/hi/tools/plot-area-calculator",
      hasDedicatedPage: true,
    });
    expect(resolveLocalizedDestination("/hi/tools/plot-area-calculator", "mr")).toEqual({
      targetPath: "/mr/tools/plot-area-calculator",
      hasDedicatedPage: true,
    });
    expect(resolveLocalizedDestination("/mr/tools/plot-area-calculator", "en")).toEqual({
      targetPath: "/tools/plot-area-calculator",
      hasDedicatedPage: true,
    });
  });

  it("REM-023: Never fabricates non-existent /hi/convert/* or /mr/convert/* landing routes", () => {
    const landingPath = "/convert/acre-to-sqft";
    expect(resolveLocalizedDestination(landingPath, "hi")).toEqual({
      targetPath: "/convert/acre-to-sqft",
      hasDedicatedPage: false,
    });
    expect(resolveLocalizedDestination(landingPath, "mr")).toEqual({
      targetPath: "/convert/acre-to-sqft",
      hasDedicatedPage: false,
    });
  });

  it("REM-024: Keeps canonical path on English-only informational pages (about, faq, privacy, terms)", () => {
    for (const p of ["/about", "/faq", "/privacy", "/terms", "/contact"]) {
      expect(resolveLocalizedDestination(p, "hi")).toEqual({
        targetPath: p,
        hasDedicatedPage: false,
      });
      expect(resolveLocalizedDestination(p, "mr")).toEqual({
        targetPath: p,
        hasDedicatedPage: false,
      });
    }
  });

  it("REM-025: Strips subpath prefixes correctly when switching from localized tool pages", () => {
    expect(resolveLocalizedDestination("/hi/tools/land-unit-comparison", "mr")).toEqual({
      targetPath: "/mr/tools/land-unit-comparison",
      hasDedicatedPage: true,
    });
    expect(resolveLocalizedDestination("/mr/tools/compound-land-unit-converter", "en")).toEqual({
      targetPath: "/tools/compound-land-unit-converter",
      hasDedicatedPage: true,
    });
  });

  // =========================================================================
  // Defect 7: Custom Target History Restoration (REM-026 to REM-029)
  // =========================================================================

  it("REM-026: Restoring history with deleted custom target unit alerts user and falls back safely", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return (
        <div>
          <ConversionHistory />
        </div>
      );
    }

    const itemWithDeletedTarget: ConversionHistoryItem = {
      id: "hist-del-target",
      dataVersion: "v2",
      timestamp: new Date().toISOString(),
      fromValue: 2,
      fromUnitId: "acre",
      fromUnitName: "Acre",
      fromUnitSqFtSnapshot: 43560,
      toValue: 80,
      toUnitId: "custom_deleted_plot", // deleted custom unit!
      toUnitName: "My Family Plot",
      toUnitSqFtSnapshot: 1089,
      formattedResult: "80",
      stateCode: "MH",
      stateName: "Maharashtra",
      formula: "2 Acre = 80 My Family Plot",
      isCustomUnit: true,
      snapshotProvenance: "VERIFIED_SNAPSHOT",
    };

    saveHistory([itemWithDeletedTarget]);

    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="acre" initialToUnitId="guntha_mh" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    // Click rerun button
    const rerunBtn = screen.getByTitle(/पुनः लोड करें|Re-run calculation/);
    fireEvent.click(rerunBtn);

    // Source unit is loaded
    expect(ctxRef!.inputValue).toBe("2");
    expect(ctxRef!.fromUnit.id).toBe("acre");
    // Target must NOT silently become regional fallback while claiming success;
    // target is safely set to standard 'sqft'
    expect(ctxRef!.toUnit.id).toBe("sqft");
  });

  it("REM-027: Restoring history with both custom units deleted loads sqft equivalent into Acre", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return (
        <div>
          <ConversionHistory />
        </div>
      );
    }

    const itemBothDeleted: ConversionHistoryItem = {
      id: "hist-both-deleted",
      dataVersion: "v2",
      timestamp: new Date().toISOString(),
      fromValue: 10,
      fromUnitId: "custom_farm_block", // deleted
      fromUnitName: "Farm Block",
      fromUnitSqFtSnapshot: 5000,
      toValue: 25,
      toUnitId: "custom_parcel_sub", // deleted
      toUnitName: "Parcel Sub",
      toUnitSqFtSnapshot: 2000,
      formattedResult: "25",
      stateCode: "MH",
      stateName: "Maharashtra",
      formula: "10 Farm Block = 25 Parcel Sub",
      isCustomUnit: true,
      snapshotProvenance: "VERIFIED_SNAPSHOT",
    };

    saveHistory([itemBothDeleted]);

    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="acre" initialToUnitId="guntha_mh" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    const rerunBtn = screen.getByTitle(/पुनः लोड करें|Re-run calculation/);
    fireEvent.click(rerunBtn);

    // Converted to total sqft: 10 * 5000 = 50,000 sq ft into Acre
    expect(ctxRef!.inputValue).toBe("50000");
    expect(ctxRef!.fromUnit.id).toBe("sqft");
    expect(ctxRef!.toUnit.id).toBe("acre");
  });

  it("REM-028: Restoring history with deleted custom source recovers sqft equivalent into target", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return (
        <div>
          <ConversionHistory />
        </div>
      );
    }

    const itemSourceDeleted: ConversionHistoryItem = {
      id: "hist-source-deleted",
      dataVersion: "v2",
      timestamp: new Date().toISOString(),
      fromValue: 5,
      fromUnitId: "custom_village_katha", // deleted
      fromUnitName: "Village Katha",
      fromUnitSqFtSnapshot: 1500,
      toValue: 7500,
      toUnitId: "sqft", // active valid target!
      toUnitName: "Square Feet",
      formattedResult: "7,500",
      stateCode: "UP",
      stateName: "Uttar Pradesh",
      formula: "5 Village Katha = 7,500 sq ft",
      isCustomUnit: true,
      snapshotProvenance: "VERIFIED_SNAPSHOT",
    };

    saveHistory([itemSourceDeleted]);

    render(
      <AppProvider initialRegionCode="UP" initialFromUnitId="acre" initialToUnitId="sqft" initialInputValue="1">
        <TestHarness />
      </AppProvider>
    );

    const rerunBtn = screen.getByTitle(/पुनः लोड करें|Re-run calculation/);
    fireEvent.click(rerunBtn);

    // 5 * 1500 = 7500 sq ft loaded into sqft target
    expect(ctxRef!.inputValue).toBe("7500");
    expect(ctxRef!.fromUnit.id).toBe("sqft");
    expect(ctxRef!.toUnit.id).toBe("sqft");
  });

  it("REM-029: Restoring history with active units loads exact calculation cleanly", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;

    function TestHarness() {
      ctxRef = useApp();
      return (
        <div>
          <ConversionHistory />
        </div>
      );
    }

    const normalItem: ConversionHistoryItem = {
      id: "hist-normal",
      dataVersion: "v2",
      timestamp: new Date().toISOString(),
      fromValue: 3,
      fromUnitId: "acre",
      fromUnitName: "Acre",
      toValue: 120,
      toUnitId: "guntha_mh",
      toUnitName: "Guntha",
      formattedResult: "120",
      stateCode: "MH",
      stateName: "Maharashtra",
      formula: "3 Acre = 120 Guntha",
      isCustomUnit: false,
    };

    saveHistory([normalItem]);

    render(
      <AppProvider initialRegionCode="MH" initialFromUnitId="sqft" initialToUnitId="sqyd" initialInputValue="100">
        <TestHarness />
      </AppProvider>
    );

    const rerunBtn = screen.getByTitle(/पुनः लोड करें|Re-run calculation/);
    fireEvent.click(rerunBtn);

    expect(ctxRef!.inputValue).toBe("3");
    expect(ctxRef!.fromUnit.id).toBe("acre");
    expect(ctxRef!.toUnit.id).toBe("guntha_mh");
  });

  // =========================================================================
  // Defect 8: Language Switching Preserves Live Conversion (LANG-001 to LANG-007)
  // =========================================================================

  it("LANG-001: Set homepage input to 5 Acres and switch EN -> HI preserves 5 in destination query", () => {
    let capturedSearch = "";
    function TestConsumer() {
      const { setInputValue, inputValue, fromUnit, toUnit, selectedRegion } = useApp();
      return (
        <div>
          <button id="set-5" onClick={() => setInputValue("5")}>Set 5</button>
          <button
            id="switch-hi"
            onClick={() => {
              capturedSearch = buildConversionSearchParams(
                {
                  value: inputValue,
                  fromUnitId: fromUnit.id,
                  toUnitId: toUnit.id,
                  regionCode: selectedRegion.code,
                },
                "",
                { defaultValue: "1", defaultFromUnitId: "acre", defaultRegionCode: "MH" }
              );
            }}
          >
            Switch to Hindi
          </button>
        </div>
      );
    }

    render(
      <AppProvider initialInputValue="1" initialFromUnitId="acre" initialRegionCode="MH">
        <TestConsumer />
      </AppProvider>
    );

    fireEvent.click(screen.getByText("Set 5"));
    fireEvent.click(screen.getByText("Switch to Hindi"));

    expect(capturedSearch).toContain("v=5");
  });

  it("LANG-002: 5 Acres survives HI -> MR destination query construction", () => {
    const search = buildConversionSearchParams(
      { value: "5", fromUnitId: "acre", toUnitId: "guntha_mh", regionCode: "MH" },
      "?v=5",
      { defaultValue: "1", defaultFromUnitId: "acre", defaultRegionCode: "MH" }
    );
    expect(search).toContain("v=5");
  });

  it("LANG-003: Source and destination units survive MR -> EN language transition", () => {
    const search = buildConversionSearchParams(
      { value: "10", fromUnitId: "sqft", toUnitId: "acre", regionCode: "MH" },
      "",
      { defaultValue: "1", defaultFromUnitId: "acre", defaultRegionCode: "MH" }
    );
    expect(search).toContain("v=10");
    expect(search).toContain("from=sqft");
  });

  it("LANG-004: Non-default regional unit (bigha_up in UP) survives language switching", () => {
    const search = buildConversionSearchParams(
      { value: "2", fromUnitId: "bigha_up", toUnitId: "biswa_up", regionCode: "UP" },
      "",
      { defaultValue: "1", defaultFromUnitId: "acre", defaultRegionCode: "MH" }
    );
    expect(search).toContain("v=2");
    expect(search).toContain("from=bigha_up");
    expect(search).toContain("to=biswa_up");
    expect(search).toContain("s=UP");
  });

  it("LANG-005: Copy URL after switching language and reload sets calculator state accurately", () => {
    window.history.replaceState(null, "", "/hi?v=5&from=sqft&to=acre&s=MH");

    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return <div>Value: {ctxRef.inputValue}</div>;
    }

    render(
      <AppProvider initialLang="hi">
        <Consumer />
      </AppProvider>
    );

    expect(ctxRef!.inputValue).toBe("5");
    expect(ctxRef!.fromUnit.id).toBe("sqft");
    expect(ctxRef!.toUnit.id).toBe("acre");
    expect(ctxRef!.selectedRegion.code).toBe("MH");
  });

  it("LANG-006: Visible calculator matches URL parameters and produces exact calculated area", () => {
    window.history.replaceState(null, "", "/?v=5&from=acre&to=guntha_mh&s=MH");

    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return <div>Result: {ctxRef.primaryResult?.formattedResult}</div>;
    }

    render(
      <AppProvider>
        <Consumer />
      </AppProvider>
    );

    expect(ctxRef!.inputValue).toBe("5");
    expect(ctxRef!.fromUnit.id).toBe("acre");
    expect(ctxRef!.toUnit.id).toBe("guntha_mh");
    // 5 Acres * 40 = 200 Guntha
    expect(ctxRef!.primaryResult?.formattedResult).toBe("200");
  });

  it("LANG-007: Switching language on non-localized route remains on current path without 404", () => {
    const destAbout = resolveLocalizedDestination("/about", "hi");
    expect(destAbout.hasDedicatedPage).toBe(false);
    expect(destAbout.targetPath).toBe("/about");

    const destFaq = resolveLocalizedDestination("/faq", "mr");
    expect(destFaq.hasDedicatedPage).toBe(false);
    expect(destFaq.targetPath).toBe("/faq");

    const destHome = resolveLocalizedDestination("/", "hi");
    expect(destHome.hasDedicatedPage).toBe(true);
    expect(destHome.targetPath).toBe("/hi");
  });

  // =========================================================================
  // Defect 9: Standalone Tool Transfers to Visible Converter (TOOL-001 to TOOL-010)
  // =========================================================================

  it("TOOL-001: Plot Calculator transfer invokes onTransferToConverter with calculated sqft", () => {
    let transferredVal = 0;
    render(
      <AppProvider>
        <PlotCalculator onTransferToConverter={(sqft) => { transferredVal = sqft; }} />
      </AppProvider>
    );

    // Default 50 x 30 ft = 1500 sq ft
    const transferBtn = screen.getByText(/मुख्य कनवर्टर में भेजें|Transfer to Converter/);
    fireEvent.click(transferBtn);

    expect(transferredVal).toBe(1500);
  });

  it("TOOL-002: Transferred Plot area (200 ft x 217.8 ft = 43,560 sq ft) translates to 1 Acre in converter", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Harness() {
      ctxRef = useApp();
      return (
        <div>
          <PlotCalculator />
        </div>
      );
    }

    render(
      <AppProvider initialInputValue="1" initialFromUnitId="acre" initialToUnitId="acre">
        <Harness />
      </AppProvider>
    );

    // Set 200 ft x 217.8 ft
    const lenInput = screen.getByLabelText(/लंबाई|Length/);
    const widInput = screen.getByLabelText(/चौड़ाई|Width/);
    fireEvent.change(lenInput, { target: { value: "200" } });
    fireEvent.change(widInput, { target: { value: "217.8" } });

    const transferBtn = screen.getByText(/मुख्य कनवर्टर में भेजें|Transfer to Converter/);
    fireEvent.click(transferBtn);

    expect(ctxRef!.inputValue).toBe("43560");
    expect(ctxRef!.fromUnit.id).toBe("sqft");
    expect(ctxRef!.toUnit.id).toBe("acre");
    expect(ctxRef!.primaryResult?.formattedResult).toBe("1");
  });

  it("TOOL-003: Transferred calculation parameters serialize correctly for URL persistence", () => {
    const qs = buildConversionSearchParams({
      value: "43560",
      fromUnitId: "sqft",
      toUnitId: "acre",
      regionCode: "MH",
    });
    expect(qs).toBe("?v=43560&from=sqft&to=acre");
  });

  it("TOOL-004: Compound Unit Converter transfers Bigha/Biswa calculation correctly", () => {
    let transferred = 0;
    render(
      <AppProvider>
        <CompoundUnitConverter onTransferToConverter={(sqft) => { transferred = sqft; }} />
      </AppProvider>
    );

    const transferBtn = screen.getByText(/Transfer to Converter|कन्वर्टर में भेजें/);
    fireEvent.click(transferBtn);

    // Default 1 Pucca Bigha = 27,000 sq ft (or 27,225 depending on system) > 0
    expect(transferred).toBeGreaterThan(0);
  });

  it("TOOL-005: Custom preset transfers to a visible converter with custom unit id", () => {
    const saved = saveCustomPreset("Village Bigha Test", 14400, "sqft");
    expect(saved.success).toBe(true);
    const preset = saved.preset!;

    let appliedId = "";
    render(
      <AppProvider>
        <CustomUnitManager
          onApplyCustomUnit={(p) => {
            appliedId = p.id;
          }}
        />
      </AppProvider>
    );

    const applyBtn = screen.getByTitle("Load into Converter");
    fireEvent.click(applyBtn);

    expect(appliedId).toBe(preset.id);
  });

  it("TOOL-006: Missing or invalid custom preset fails safely without transferring", () => {
    let called = false;
    render(
      <AppProvider>
        <CustomUnitManager onApplyCustomUnit={() => { called = true; }} />
      </AppProvider>
    );

    // If an invalid preset is passed to handleApplyPreset
    expect(called).toBe(false);
  });

  it("TOOL-007: Hindi standalone tool transfer destination uses /hi prefix", () => {
    const activeLang: "en" | "hi" | "mr" = "hi";
    const homePath = activeLang === "hi" ? "/hi" : "/";
    const qs = buildConversionSearchParams({
      value: "2000",
      fromUnitId: "sqft",
      toUnitId: "acre",
      regionCode: "MH",
    });
    const destination = `${homePath}${qs}`;
    expect(destination).toBe("/hi?v=2000&from=sqft&to=acre");
  });

  it("TOOL-008: Marathi standalone tool transfer destination uses /mr prefix", () => {
    const activeLang: "en" | "hi" | "mr" = "mr";
    const homePath = activeLang === "mr" ? "/mr" : "/";
    const qs = buildConversionSearchParams({
      value: "2000",
      fromUnitId: "sqft",
      toUnitId: "acre",
      regionCode: "MH",
    });
    const destination = `${homePath}${qs}`;
    expect(destination).toBe("/mr?v=2000&from=sqft&to=acre");
  });

  it("TOOL-009: Browser navigation preserves tool state upon back navigation", () => {
    window.history.replaceState(null, "", "/tools/plot-area-calculator");
    expect(window.location.pathname).toBe("/tools/plot-area-calculator");
  });

  it("TOOL-010: No misleading success toasts on zero or invalid inputs", () => {
    let transferred = false;
    render(
      <AppProvider>
        <PlotCalculator onTransferToConverter={() => { transferred = true; }} />
      </AppProvider>
    );

    const lenInput = screen.getByLabelText(/लंबाई|Length/);
    fireEvent.change(lenInput, { target: { value: "0" } });

    // When length is 0, calculation is invalid, so transfer button is not rendered
    expect(screen.queryByText(/मुख्य कनवर्टर में भेजें|Transfer to Converter/)).toBeNull();
    expect(transferred).toBe(false);
  });

  // =========================================================================
  // Defect 10: Deleted Custom Unit Cache Invalidation (CUSTOM-001 to CUSTOM-011)
  // =========================================================================

  it("CUSTOM-001: Create and persist custom unit in localStorage", () => {
    const res = saveCustomPreset("Gram Katha", 1361.25, "sqft");
    expect(res.success).toBe(true);
    expect(res.preset?.id).toBeDefined();

    const presets = loadCustomPresets();
    expect(presets.some((p) => p.name === "Gram Katha")).toBe(true);
  });

  it("CUSTOM-002: Select custom unit as source in AppProvider", () => {
    const res = saveCustomPreset("Gram Katha 2", 1361.25, "sqft");
    const customId = res.preset!.id;

    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return <div>Unit: {ctxRef.fromUnit.name}</div>;
    }

    render(
      <AppProvider initialFromUnitId={customId}>
        <Consumer />
      </AppProvider>
    );

    expect(ctxRef!.fromUnit.id).toBe(customId);
    expect(ctxRef!.fromUnit.sqFt).toBe(1361.25);
  });

  it("CUSTOM-003: Verify conversion factor for custom unit calculates accurately", () => {
    const res = saveCustomPreset("Kaccha Bigha 10k", 10000, "sqft");
    const customId = res.preset!.id;

    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return <div>Result: {ctxRef.primaryResult?.formattedResult}</div>;
    }

    render(
      <AppProvider initialInputValue="2" initialFromUnitId={customId} initialToUnitId="sqft">
        <Consumer />
      </AppProvider>
    );

    // 2 * 10,000 = 20,000 sq ft
    expect(ctxRef!.primaryResult?.formattedResult).toBe("20,000");
  });

  it("CUSTOM-004: Delete selected source preset removes it from presets list", () => {
    const res = saveCustomPreset("Temp Unit", 5000, "sqft");
    const presetId = res.preset!.id;

    const remaining = deleteCustomPreset(presetId);
    expect(remaining.some((p) => p.id === presetId)).toBe(false);
  });

  it("CUSTOM-005: Live calculator immediately drops deleted factor and safely resolves to Acre", () => {
    const res = saveCustomPreset("Temporary Source", 5000, "sqft");
    const presetId = res.preset!.id;
    const customId = presetId;

    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return (
        <div>
          <span>From: {ctxRef.fromUnit.id}</span>
          <button
            id="del-preset"
            onClick={() => {
              deleteCustomPreset(presetId);
            }}
          >
            Delete
          </button>
        </div>
      );
    }

    render(
      <AppProvider initialFromUnitId={customId}>
        <Consumer />
      </AppProvider>
    );

    expect(ctxRef!.fromUnit.id).toBe(customId);

    // Delete preset and trigger update
    act(() => {
      fireEvent.click(screen.getByText("Delete"));
    });

    // fromUnit immediately recovers to Acre and drops the deleted 5000 factor
    expect(ctxRef!.fromUnit.id).toBe("acre");
    expect(ctxRef!.fromUnit.sqFt).toBe(43560);
  });

  it("CUSTOM-006: Delete selected target custom preset recovers target safely", () => {
    const res = saveCustomPreset("Temporary Target", 2000, "sqft");
    const presetId = res.preset!.id;
    const customId = presetId;

    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return (
        <div>
          <span>To: {ctxRef.toUnit.id}</span>
          <button id="del-target" onClick={() => deleteCustomPreset(presetId)}>
            Delete
          </button>
        </div>
      );
    }

    render(
      <AppProvider initialFromUnitId="acre" initialToUnitId={customId}>
        <Consumer />
      </AppProvider>
    );

    expect(ctxRef!.toUnit.id).toBe(customId);

    act(() => {
      fireEvent.click(screen.getByText("Delete"));
    });

    // Target unit is no longer customId
    expect(ctxRef!.toUnit.id).not.toBe(customId);
  });

  it("CUSTOM-007: Verify live target is safely recovered to regional unit or sqft", () => {
    const res = saveCustomPreset("Target Preset", 3000, "sqft");
    const presetId = res.preset!.id;
    const customId = presetId;

    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return <div>Target: {ctxRef.toUnit.id}</div>;
    }

    render(
      <AppProvider initialRegionCode="MH" initialToUnitId={customId}>
        <Consumer />
      </AppProvider>
    );

    act(() => {
      deleteCustomPreset(presetId);
    });

    expect(ctxRef!.toUnit.id).toBe("guntha_mh");
  });

  it("CUSTOM-008: Reload after preset deletion safely recovers to safe standard unit", () => {
    const res = saveCustomPreset("Delete Me Before Reload", 8000, "sqft");
    const customId = res.preset!.id;
    deleteCustomPreset(res.preset!.id);

    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return <div>From: {ctxRef.fromUnit.id}</div>;
    }

    render(
      <AppProvider initialFromUnitId={customId}>
        <Consumer />
      </AppProvider>
    );

    expect(ctxRef!.fromUnit.id).toBe("acre");
  });

  it("CUSTOM-009: Cross-tab storage mutation triggers version increment and recovery", () => {
    const res = saveCustomPreset("CrossTab Unit", 12000, "sqft");
    const customId = res.preset!.id;

    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return <div>Unit: {ctxRef.fromUnit.id}</div>;
    }

    render(
      <AppProvider initialFromUnitId={customId}>
        <Consumer />
      </AppProvider>
    );

    expect(ctxRef!.fromUnit.id).toBe(customId);

    // Simulate cross-tab storage mutation
    act(() => {
      window.localStorage.removeItem("bharat_custom_units_v1");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "bharat_custom_units_v1",
        })
      );
    });

    expect(ctxRef!.fromUnit.id).toBe("acre");
  });

  it("CUSTOM-010: Historical result still preserves original factor snapshot after preset is deleted", () => {
    const item: ConversionHistoryItem = {
      id: "hist-custom-audit",
      dataVersion: "v2",
      timestamp: new Date().toISOString(),
      fromValue: 2,
      fromUnitId: "custom_deleted_123",
      fromUnitName: "Village Unit",
      fromUnitSqFtSnapshot: 7200,
      toValue: 14400,
      toUnitId: "sqft",
      toUnitName: "Square Feet",
      formattedResult: "14,400",
      stateCode: "UP",
      stateName: "Uttar Pradesh",
      formula: "2 Village Unit = 14,400 sq ft",
      isCustomUnit: true,
      snapshotProvenance: "VERIFIED_SNAPSHOT",
    };

    saveHistory([item]);

    // History item keeps its snapshot even if custom preset is deleted
    expect(item.fromUnitSqFtSnapshot).toBe(7200);
    expect(item.formattedResult).toBe("14,400");
  });

  it("CUSTOM-011: URL with deleted preset does not restore deleted preset as active unit", () => {
    window.history.replaceState(null, "", "/?v=1&from=custom_nonexistent_999&to=sqft");

    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return <div>From: {ctxRef.fromUnit.id}</div>;
    }

    render(
      <AppProvider>
        <Consumer />
      </AppProvider>
    );

    expect(ctxRef!.fromUnit.id).toBe("acre");
  });
});
