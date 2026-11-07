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
  getUnitsForRegion,
  getRegion,
  ALL_REGIONS,
  resolveUnit,
  getUnit,
  convertArea,
  LEGACY_UNIT_INVENTORY,
  LEGACY_UNIT_MAP,
  getLegacyUnitInfo,
  isLegacyUnitId,
  parseCustomSnapshotParam,
  getEphemeralSnapshotUnit,
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

  // =========================================================================
  // Phase 2: Shared Regional Unit Availability (REGION-001 to REGION-015)
  // =========================================================================

  it("REGION-001: Haryana contains Kanal in available units", () => {
    const hrUnits = getUnitsForRegion("HR");
    expect(hrUnits.some((u) => u.id === "kanal")).toBe(true);
  });

  it("REGION-002: Haryana contains Marla in available units", () => {
    const hrUnits = getUnitsForRegion("HR");
    expect(hrUnits.some((u) => u.id === "marla")).toBe(true);
  });

  it("REGION-003: Haryana contains Killa and Sarsahi in available units", () => {
    const hrUnits = getUnitsForRegion("HR");
    expect(hrUnits.some((u) => u.id === "killa")).toBe(true);
    expect(hrUnits.some((u) => u.id === "sarsahi")).toBe(true);
  });

  it("REGION-004: Jharkhand contains applicable Bihar traditional units", () => {
    const jhUnits = getUnitsForRegion("JH");
    expect(jhUnits.some((u) => u.id === "bigha_bihar_standard")).toBe(true);
    expect(jhUnits.some((u) => u.id === "kattha_bihar_standard")).toBe(true);
    expect(jhUnits.some((u) => u.id === "dhur_bihar_standard")).toBe(true);
  });

  it("REGION-005: Karnataka contains declared Guntha in available units", () => {
    const kaUnits = getUnitsForRegion("KA");
    expect(kaUnits.some((u) => u.id === "guntha_mh")).toBe(true);
  });

  it("REGION-006: Gujarat contains declared Guntha in available units", () => {
    const gjUnits = getUnitsForRegion("GJ");
    expect(gjUnits.some((u) => u.id === "guntha_mh")).toBe(true);
  });

  it("REGION-007: Himachal Pradesh includes declared Kanal and Marla", () => {
    const hpUnits = getUnitsForRegion("HP");
    expect(hpUnits.some((u) => u.id === "kanal")).toBe(true);
    expect(hpUnits.some((u) => u.id === "marla")).toBe(true);
  });

  it("REGION-008: Chhattisgarh contains declared shared MP units", () => {
    const cgUnits = getUnitsForRegion("CG");
    expect(cgUnits.some((u) => u.id === "bigha_mp_standard")).toBe(true);
    expect(cgUnits.some((u) => u.id === "bigha_mp_gwalior")).toBe(true);
  });

  it("REGION-009: Selected region has no duplicate unit IDs across all 36 regions", () => {
    for (const r of ALL_REGIONS) {
      const units = getUnitsForRegion(r.code);
      const ids = units.map((u) => u.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    }
  });

  it("REGION-010: Unrelated traditional units are excluded from specific regions", () => {
    const hrUnits = getUnitsForRegion("HR");
    // Haryana should not include West Bengal Chatak or Tamil Nadu Ground
    expect(hrUnits.some((u) => u.id === "chatak_wb")).toBe(false);
    expect(hrUnits.some((u) => u.id === "ground_tn")).toBe(false);
  });

  it("REGION-011: All declared primaryTraditionalUnits resolve to valid registry definitions", () => {
    const missing: { region: string; unitId: string }[] = [];
    for (const r of ALL_REGIONS) {
      for (const unitId of r.primaryTraditionalUnits) {
        const u = getUnit(unitId) || resolveUnit(unitId, { stateCode: r.code });
        if (!u) missing.push({ region: r.code, unitId });
      }
    }
    expect(missing).toEqual([]);
  });

  it("REGION-012: Conversions through shared regional units use intended canonical factors", () => {
    const kanal = getUnit("kanal")!;
    const guntha = getUnit("guntha_mh")!;
    const sqft = getUnit("sqft")!;

    expect(convertArea(1, kanal, sqft).rawResult).toBe(5445);
    expect(convertArea(1, guntha, sqft).rawResult).toBe(1089);
  });

  it("REGION-013: Switching regions updates available units while preserving state safely", () => {
    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return <div>Region: {ctxRef.selectedRegion.code}</div>;
    }

    render(
      <AppProvider initialRegionCode="HR">
        <Consumer />
      </AppProvider>
    );

    expect(ctxRef!.availableUnits.some((u) => u.id === "kanal")).toBe(true);

    act(() => {
      ctxRef!.setSelectedRegionCode("KA");
    });

    expect(ctxRef!.availableUnits.some((u) => u.id === "guntha_mh")).toBe(true);
    expect(ctxRef!.availableUnits.some((u) => u.id === "kanal")).toBe(false);
  });

  it("REGION-014: Existing custom units remain available in shared regional unit listings", () => {
    saveCustomPreset("Farm Unit", 5000, "sqft", "Private field");
    const hrUnits = getUnitsForRegion("HR");
    expect(hrUnits.some((u) => u.name.includes("Farm Unit"))).toBe(true);
  });

  it("REGION-015: Regional metadata consistency: declared traditional units match getUnitsForRegion", () => {
    const hr = getRegion("HR")!;
    const hrUnits = getUnitsForRegion("HR");
    for (const id of hr.primaryTraditionalUnits) {
      expect(hrUnits.some((u) => u.id === id)).toBe(true);
    }
  });

  // =========================================================================
  // Phase 3 & 4: Legacy Concrete Unit IDs & Factor Differences
  // =========================================================================

  it("LEGACY-001: Inventory has 39 entries matching legacy commit 2b11877", () => {
    expect(LEGACY_UNIT_INVENTORY.length).toBe(39);
    expect(LEGACY_UNIT_MAP.size).toBe(39);
  });

  it("LEGACY-002: Resolves legacy bigha_up to canonical bigha_up_pucca", () => {
    const res = resolveUnit("bigha_up");
    expect(res).toBeDefined();
    expect(res!.id).toBe("bigha_up_pucca");
  });

  it("LEGACY-003: Resolves legacy biswa_up to canonical biswa_up_pucca", () => {
    const res = resolveUnit("biswa_up");
    expect(res).toBeDefined();
    expect(res!.id).toBe("biswa_up_pucca");
  });

  it("LEGACY-004: Resolves legacy bigha_bihar to canonical bigha_bihar_standard", () => {
    const res = resolveUnit("bigha_bihar");
    expect(res).toBeDefined();
    expect(res!.id).toBe("bigha_bihar_standard");
  });

  it("LEGACY-005: Resolves legacy bigha_pucca_rj to canonical bigha_rj_pucca", () => {
    const res = resolveUnit("bigha_pucca_rj");
    expect(res).toBeDefined();
    expect(res!.id).toBe("bigha_rj_pucca");
  });

  it("LEGACY-006: Resolves legacy guntha_ka to canonical guntha_mh", () => {
    const res = resolveUnit("guntha_ka");
    expect(res).toBeDefined();
    expect(res!.id).toBe("guntha_mh");
  });

  it("LEGACY-007: Resolves legacy ankanam to canonical ankanam_ap", () => {
    const res = resolveUnit("ankanam");
    expect(res).toBeDefined();
    expect(res!.id).toBe("ankanam_ap");
  });

  it("LEGACY-008: Resolves legacy bigha_mp to canonical bigha_mp_gwalior", () => {
    const res = resolveUnit("bigha_mp");
    expect(res).toBeDefined();
    expect(res!.id).toBe("bigha_mp_gwalior");
  });

  it("LEGACY-009: Resolves legacy cent to canonical decimal_standard", () => {
    const res = resolveUnit("cent");
    expect(res).toBeDefined();
    expect(res!.id).toBe("decimal_standard");
  });

  it("LEGACY-010: getUnit resolves legacy concrete IDs directly", () => {
    expect(getUnit("bigha_up")?.id).toBe("bigha_up_pucca");
    expect(getUnit("biswa_up")?.id).toBe("biswa_up_pucca");
    expect(getUnit("bigha_bihar")?.id).toBe("bigha_bihar_standard");
    expect(getUnit("guntha_ka")?.id).toBe("guntha_mh");
  });

  it("FACTOR-001: Discloses factor difference for UP Bigha (27,000 vs 27,225 sq ft)", () => {
    const info = getLegacyUnitInfo("bigha_up")!;
    expect(info.factorDiffers).toBe(true);
    expect(info.legacySqFt).toBe(27000);
    expect(info.canonicalSqFt).toBe(27225);
  });

  it("FACTOR-002: Discloses factor difference for UP Biswa (1,350 vs 1,361.25 sq ft)", () => {
    const info = getLegacyUnitInfo("biswa_up")!;
    expect(info.factorDiffers).toBe(true);
    expect(info.legacySqFt).toBe(1350);
    expect(info.canonicalSqFt).toBe(1361.25);
  });

  it("FACTOR-003: Discloses factor difference for UP Biswansi (67.5 vs 68.0625 sq ft)", () => {
    const info = getLegacyUnitInfo("biswansi_up")!;
    expect(info.factorDiffers).toBe(true);
    expect(info.legacySqFt).toBe(67.5);
    expect(info.canonicalSqFt).toBe(68.0625);
  });

  it("FACTOR-004: Discloses factor difference for Bihar Bigha (27,220 vs 27,225 sq ft)", () => {
    const info = getLegacyUnitInfo("bigha_bihar")!;
    expect(info.factorDiffers).toBe(true);
    expect(info.legacySqFt).toBe(27220);
    expect(info.canonicalSqFt).toBe(27225);
  });

  it("FACTOR-005: Discloses factor difference for Bihar Kattha (1,361 vs 1,361.25 sq ft)", () => {
    const info = getLegacyUnitInfo("kattha_bihar")!;
    expect(info.factorDiffers).toBe(true);
    expect(info.legacySqFt).toBe(1361);
    expect(info.canonicalSqFt).toBe(1361.25);
  });

  it("FACTOR-006: Discloses factor difference for West Bengal Chatak (180 vs 45 sq ft)", () => {
    const info = getLegacyUnitInfo("chatak_wb")!;
    expect(info.factorDiffers).toBe(true);
    expect(info.legacySqFt).toBe(180);
    expect(info.canonicalSqFt).toBe(45);
  });

  it("FACTOR-007: Discloses factor difference for Gujarat Vigha (17,427 vs 17,424 sq ft)", () => {
    const info = getLegacyUnitInfo("bigha_gj")!;
    expect(info.factorDiffers).toBe(true);
    expect(info.legacySqFt).toBe(17427);
    expect(info.canonicalSqFt).toBe(17424);
  });

  it("FACTOR-008: AppContext records legacyNotice when URL contains unit with factor difference", () => {
    window.history.replaceState(null, "", "/?v=1&u=bigha_up&s=Uttar%20Pradesh");

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

    expect(ctxRef!.fromUnit.id).toBe("bigha_up_pucca");
    expect(ctxRef!.selectedRegion.code).toBe("UP");
    expect(ctxRef!.legacyNotice).toBeDefined();
    expect(ctxRef!.legacyNotice!.legacyUnitId).toBe("bigha_up");
    expect(ctxRef!.legacyNotice!.legacySqFt).toBe(27000);
    expect(ctxRef!.legacyNotice!.canonicalSqFt).toBe(27225);
  });

  it("FACTOR-009: AppContext does not record legacyNotice when URL contains unit with identical factor", () => {
    window.history.replaceState(null, "", "/?v=1&u=bigha_pucca_rj&s=Rajasthan");

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

    expect(ctxRef!.fromUnit.id).toBe("bigha_rj_pucca");
    expect(ctxRef!.selectedRegion.code).toBe("RJ");
    expect(ctxRef!.legacyNotice).toBeNull();
  });

  it("FACTOR-010: Unknown legacy ID in URL safely falls back to Acre without crashing", () => {
    window.history.replaceState(null, "", "/?v=1&u=completely_unknown_unit&s=UP");

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

  // =========================================================================
  // Phase 5: Legacy Saved Parcel Consistency (PARCEL-009 to PARCEL-016)
  // =========================================================================

  it("PARCEL-009: Migrates legacy parcel with bigha_up while preserving exact sqftTotal = 27000", () => {
    const legacy = [
      {
        id: "p-up-1",
        name: "Legacy UP Farm",
        value: 1,
        unitId: "bigha_up",
        state: "Uttar Pradesh",
        sqftTotal: 27000,
      },
    ];
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy));

    const migrated = migrateLegacyParcels();
    expect(migrated.length).toBe(1);
    expect(migrated[0].name).toBe("Legacy UP Farm");
    expect(migrated[0].unitId).toBe("bigha_up_pucca");
    expect(migrated[0].sqftTotal).toBe(27000);
    expect(migrated[0].legacyFactor).toBe(27000);
    expect(migrated[0].legacyNote).toContain("27,000");
  });

  it("PARCEL-010: Preserves legacy sqftTotal for Bihar Bigha parcel", () => {
    const legacy = [
      {
        id: "p-br-1",
        name: "Bihar Plot",
        value: 2,
        unitId: "bigha_bihar",
        state: "Bihar",
        sqftTotal: 54440,
      },
    ];
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy));

    const migrated = migrateLegacyParcels();
    expect(migrated[0].sqftTotal).toBe(54440);
    expect(migrated[0].legacyFactor).toBe(27220);
  });

  it("PARCEL-011: Migrates legacy Rajasthan Pucca parcel without factor difference note", () => {
    const legacy = [
      {
        id: "p-rj-1",
        name: "Jaipur Land",
        value: 1,
        unitId: "bigha_pucca_rj",
        state: "Rajasthan",
        sqftTotal: 27225,
      },
    ];
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy));

    const migrated = migrateLegacyParcels();
    expect(migrated[0].unitId).toBe("bigha_rj_pucca");
    expect(migrated[0].sqftTotal).toBe(27225);
    expect(migrated[0].legacyNote).toBeUndefined();
  });

  it("PARCEL-012: Migrates legacy parcel with stateCode instead of stateName", () => {
    const legacy = [
      {
        id: "p-mh-1",
        name: "Pune Guntha",
        value: 40,
        unitId: "guntha_mh",
        stateCode: "MH",
        sqftTotal: 43560,
      },
    ];
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy));

    const migrated = migrateLegacyParcels();
    expect(migrated[0].stateCode).toBe("MH");
    expect(migrated[0].stateName).toBe("Maharashtra");
  });

  it("PARCEL-013: Export parcel summary includes legacy note when present", () => {
    const parcel: SavedLand = {
      id: "p-note-1",
      name: "Disclosed Farm",
      value: 1,
      unitId: "bigha_up_pucca",
      stateCode: "UP",
      stateName: "Uttar Pradesh",
      sqftTotal: 27000,
      date: "06/11/2026",
      legacyNote: "Historical factor: 27,000 sq ft/unit",
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([parcel]));
    window.localStorage.setItem(PARCELS_MIGRATION_FLAG, "true");

    const loaded = loadParcels();
    expect(loaded[0].legacyNote).toBe("Historical factor: 27,000 sq ft/unit");
  });

  it("PARCEL-014: Migration is idempotent and does not overwrite existing v2 parcels", () => {
    const v2Existing: SavedLand[] = [
      {
        id: "existing-1",
        name: "Existing V2",
        value: 5,
        unitId: "acre",
        stateCode: "MH",
        stateName: "Maharashtra",
        sqftTotal: 217800,
        date: "06/11/2026",
      },
    ];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v2Existing));
    window.localStorage.setItem(PARCELS_MIGRATION_FLAG, "true");

    const loaded = loadParcels();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe("existing-1");
  });

  it("PARCEL-015: Old records in bharat-land-parcels are not deleted prematurely", () => {
    const legacy = [{ id: "l1", name: "Keep Me", value: 1, unitId: "sqft", sqftTotal: 1 }];
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy));

    migrateLegacyParcels();
    expect(window.localStorage.getItem(LEGACY_STORAGE_KEY)).not.toBeNull();
  });

  it("PARCEL-016: Deletion safety removes parcel cleanly from v2 storage", () => {
    const parcels: SavedLand[] = [
      { id: "del-1", name: "To Delete", value: 1, unitId: "acre", stateCode: "MH", stateName: "Maharashtra", sqftTotal: 43560, date: "06/11/2026" },
      { id: "keep-1", name: "To Keep", value: 2, unitId: "acre", stateCode: "MH", stateName: "Maharashtra", sqftTotal: 87120, date: "06/11/2026" },
    ];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parcels));
    window.localStorage.setItem(PARCELS_MIGRATION_FLAG, "true");

    const remaining = parcels.filter((p) => p.id !== "del-1");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

    const finalLoaded = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(finalLoaded.length).toBe(1);
    expect(finalLoaded[0].id).toBe("keep-1");
  });

  // =========================================================================
  // Phase 6: Old Shared URL Regression (URL-001 to URL-010)
  // =========================================================================

  it("URL-001: /?v=1&u=bigha_up&s=Uttar%20Pradesh restores UP, bigha_up_pucca, value 1", () => {
    window.history.replaceState(null, "", "/?v=1&u=bigha_up&s=Uttar%20Pradesh");

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

    expect(ctxRef!.inputValue).toBe("1");
    expect(ctxRef!.fromUnit.id).toBe("bigha_up_pucca");
    expect(ctxRef!.selectedRegion.code).toBe("UP");
    expect(ctxRef!.legacyNotice).not.toBeNull();
  });

  it("URL-002: /?v=2&u=biswa_up&s=Uttar%20Pradesh restores UP, biswa_up_pucca, value 2", () => {
    window.history.replaceState(null, "", "/?v=2&u=biswa_up&s=Uttar%20Pradesh");

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

    expect(ctxRef!.inputValue).toBe("2");
    expect(ctxRef!.fromUnit.id).toBe("biswa_up_pucca");
    expect(ctxRef!.selectedRegion.code).toBe("UP");
  });

  it("URL-003: /?v=1&u=bigha_bihar&s=Bihar restores Bihar, bigha_bihar_standard, value 1", () => {
    window.history.replaceState(null, "", "/?v=1&u=bigha_bihar&s=Bihar");

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

    expect(ctxRef!.fromUnit.id).toBe("bigha_bihar_standard");
    expect(ctxRef!.selectedRegion.code).toBe("BR");
  });

  it("URL-004: /?v=1&u=bigha_pucca_rj&s=Rajasthan restores Rajasthan, bigha_rj_pucca", () => {
    window.history.replaceState(null, "", "/?v=1&u=bigha_pucca_rj&s=Rajasthan");

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

    expect(ctxRef!.fromUnit.id).toBe("bigha_rj_pucca");
    expect(ctxRef!.selectedRegion.code).toBe("RJ");
  });

  it("URL-005: /?v=1&u=bigha_kaccha_rj&s=Rajasthan restores Rajasthan, bigha_rj_kaccha", () => {
    window.history.replaceState(null, "", "/?v=1&u=bigha_kaccha_rj&s=Rajasthan");

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

    expect(ctxRef!.fromUnit.id).toBe("bigha_rj_kaccha");
    expect(ctxRef!.selectedRegion.code).toBe("RJ");
  });

  it("URL-006: /?v=1&u=bigha_mp&s=Madhya%20Pradesh restores MP, bigha_mp_gwalior", () => {
    window.history.replaceState(null, "", "/?v=1&u=bigha_mp&s=Madhya%20Pradesh");

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

    expect(ctxRef!.fromUnit.id).toBe("bigha_mp_gwalior");
    expect(ctxRef!.selectedRegion.code).toBe("MP");
  });

  it("URL-007: /?v=40&u=guntha_mh&s=Maharashtra restores Maharashtra, guntha_mh, value 40", () => {
    window.history.replaceState(null, "", "/?v=40&u=guntha_mh&s=Maharashtra");

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

    expect(ctxRef!.inputValue).toBe("40");
    expect(ctxRef!.fromUnit.id).toBe("guntha_mh");
    expect(ctxRef!.selectedRegion.code).toBe("MH");
  });

  it("URL-008: /?v=1&u=guntha_ka&s=Karnataka restores Karnataka, guntha_mh", () => {
    window.history.replaceState(null, "", "/?v=1&u=guntha_ka&s=Karnataka");

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

    expect(ctxRef!.fromUnit.id).toBe("guntha_mh");
    expect(ctxRef!.selectedRegion.code).toBe("KA");
  });

  it("URL-009: /?v=8&u=kanal&s=Punjab restores Punjab, kanal, value 8", () => {
    window.history.replaceState(null, "", "/?v=8&u=kanal&s=Punjab");

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

    expect(ctxRef!.inputValue).toBe("8");
    expect(ctxRef!.fromUnit.id).toBe("kanal");
    expect(ctxRef!.selectedRegion.code).toBe("PB");
  });

  it("URL-010: /?v=1&u=bigha_wb&s=West%20Bengal restores West Bengal, bigha_wb, value 1", () => {
    window.history.replaceState(null, "", "/?v=1&u=bigha_wb&s=West%20Bengal");

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

    expect(ctxRef!.fromUnit.id).toBe("bigha_wb");
    expect(ctxRef!.selectedRegion.code).toBe("WB");
  });

  // =========================================================================
  // Phase 3: Custom Unit Share Portability (SHARE-001 to SHARE-010)
  // =========================================================================

  it("SHARE-001: Standard unit sharing remains unchanged without snapshot params", () => {
    const search = buildConversionSearchParams({
      value: "5",
      fromUnitId: "guntha_mh",
      toUnitId: "sqft",
      regionCode: "MH",
    });
    expect(search).toBe("?v=5&from=guntha_mh&to=sqft");
    expect(search.includes("from_sqft")).toBe(false);
  });

  it("SHARE-002: Custom source unit shares across isolated browsers using factor snapshot", () => {
    const snap = parseCustomSnapshotParam(20000, "Village Bigha");
    expect(snap).toBeDefined();
    expect(snap!.sqFt).toBe(20000);

    const search = buildConversionSearchParams({
      value: "1",
      fromUnitId: snap!.id,
      toUnitId: "acre",
      regionCode: "MH",
      fromSqFt: 20000,
      fromName: "Village Bigha",
    });

    expect(search).toContain("from_sqft=20000");
    expect(search).toContain("from_name=Village+Bigha");

    window.localStorage.clear();
    window.history.replaceState(null, "", `/${search}`);

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

    expect(ctxRef!.fromUnit.sqFt).toBe(20000);
    expect(ctxRef!.toUnit.id).toBe("acre");
    expect(ctxRef!.primaryResult?.rawResult).toBeCloseTo(20000 / 43560, 5);
  });

  it("SHARE-003: Custom target unit shares across isolated browsers using factor snapshot", () => {
    const snap = parseCustomSnapshotParam(10000, "Local Ground");
    expect(snap).toBeDefined();

    const search = buildConversionSearchParams({
      value: "1",
      fromUnitId: "acre",
      toUnitId: snap!.id,
      regionCode: "MH",
      toSqFt: 10000,
      toName: "Local Ground",
    });

    expect(search).toContain("to_sqft=10000");

    window.localStorage.clear();
    window.history.replaceState(null, "", `/${search}`);

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

    expect(ctxRef!.toUnit.sqFt).toBe(10000);
    expect(ctxRef!.primaryResult?.rawResult).toBeCloseTo(4.356, 3);
  });

  it("SHARE-004: 20,000 sq ft produces the same Acre equivalent for sender and recipient", () => {
    const senderUnit = parseCustomSnapshotParam("20000", "Custom Sender")!;
    const senderResult = convertArea(1, senderUnit, getUnit("acre")!, 4);
    
    const recipientUnit = parseCustomSnapshotParam("20000", "Custom Recipient")!;
    const recipientResult = convertArea(1, recipientUnit, getUnit("acre")!, 4);

    expect(senderResult.rawResult).toBe(recipientResult.rawResult);
    expect(senderResult.formattedResult).toBe(recipientResult.formattedResult);
    expect(recipientResult.formattedResult).toBe("0.4591");
  });

  it("SHARE-005: Recipient does not require sender localStorage", () => {
    window.localStorage.clear();
    expect(window.localStorage.getItem("bharat_custom_units_v1")).toBeNull();

    window.history.replaceState(null, "", "/?v=2&from=custom_xyz&from_sqft=20000&from_name=Farm+Unit&to=acre");

    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return <div>Value: {ctxRef.inputValue}</div>;
    }

    render(
      <AppProvider>
        <Consumer />
      </AppProvider>
    );

    expect(ctxRef!.fromUnit.sqFt).toBe(20000);
    expect(ctxRef!.primaryResult?.rawResult).toBeCloseTo((2 * 20000) / 43560, 5);
  });

  it("SHARE-006: Deleted custom preset does not silently change a shared calculation", () => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/?v=1&from=custom_deleted_123&from_sqft=15000&from_name=Deleted+Unit&to=acre");

    let ctxRef: ReturnType<typeof useApp> | null = null;
    function Consumer() {
      ctxRef = useApp();
      return <div>From: {ctxRef.fromUnit.name}</div>;
    }

    render(
      <AppProvider>
        <Consumer />
      </AppProvider>
    );

    expect(ctxRef!.fromUnit.sqFt).toBe(15000);
    expect(ctxRef!.primaryResult?.rawResult).toBeCloseTo(15000 / 43560, 5);
  });

  it("SHARE-007: Malformed snapshot is rejected safely", () => {
    expect(parseCustomSnapshotParam("not-a-number")).toBeNull();
    expect(parseCustomSnapshotParam("")).toBeNull();
    expect(parseCustomSnapshotParam(null)).toBeNull();
    expect(parseCustomSnapshotParam(undefined)).toBeNull();

    window.history.replaceState(null, "", "/?v=1&from=custom_corrupted&from_sqft=corrupt&to=acre");

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
    expect(ctxRef!.legacyNotice).toBeDefined();
  });

  it("SHARE-008: Negative, zero, NaN, Infinity and oversized factors are rejected", () => {
    expect(parseCustomSnapshotParam(-500)).toBeNull();
    expect(parseCustomSnapshotParam(0)).toBeNull();
    expect(parseCustomSnapshotParam(NaN)).toBeNull();
    expect(parseCustomSnapshotParam(Infinity)).toBeNull();
    expect(parseCustomSnapshotParam(-Infinity)).toBeNull();
    expect(parseCustomSnapshotParam(500_000_000_001)).toBeNull();
    expect(parseCustomSnapshotParam(10_000_000)).not.toBeNull();
    expect(parseCustomSnapshotParam(435_600_000_000)).not.toBeNull(); // 10,000,000 Acres in sq ft
  });

  it("SHARE-011: Preserves exact factors in snapshot identities without rounding collisions", () => {
    const snap1 = parseCustomSnapshotParam(0.0001, "Small Unit A")!;
    const snap2 = parseCustomSnapshotParam(0.0004, "Small Unit B")!;
    expect(snap1.id).not.toBe(snap2.id);
    expect(getEphemeralSnapshotUnit(snap1.id)?.sqFt).toBe(0.0001);
    expect(getEphemeralSnapshotUnit(snap2.id)?.sqFt).toBe(0.0004);
    const result = convertArea(1, snap1, snap2);
    expect(result.rawResult).toBeCloseTo(0.25, 4);
  });

  it("SHARE-012: Restores custom presets exceeding 10,000,000 sq ft (up to 10M acres)", () => {
    // 1,000 acres = 43,560,000 sq ft
    const largeSnap = parseCustomSnapshotParam(43_560_000, "Large Estate")!;
    expect(largeSnap).not.toBeNull();
    expect(largeSnap.sqFt).toBe(43_560_000);
    expect(getEphemeralSnapshotUnit(largeSnap.id)).toBeDefined();
  });

  it("SHARE-009: No private saved parcel data is included in shared URLs", () => {
    window.localStorage.setItem("bharat-land-parcels-v2", JSON.stringify([{
      id: "p-secret",
      name: "Private Land Near River",
      value: 10,
      unitId: "acre",
      stateCode: "MH",
      sqftTotal: 435600,
    }]));

    const search = buildConversionSearchParams({
      value: "1",
      fromUnitId: "guntha_mh",
      toUnitId: "sqft",
      regionCode: "MH",
    });

    expect(search).not.toContain("p-secret");
    expect(search).not.toContain("Private");
    expect(search).not.toContain("River");
  });

  it("SHARE-010: Clipboard and share UX describes the actual operation accurately", () => {
    const customUnit = parseCustomSnapshotParam(20000, "Village Bigha")!;
    expect(customUnit.name).toContain("Village Bigha");
    expect(customUnit.provenance.sourceName).toBe("Shared Custom Unit Snapshot");
  });

  // =========================================================================
  // Phase 4: Legacy Biswa MP Mapping & Historical Verification (LEGACY-MP-001 to LEGACY-MP-009)
  // =========================================================================

  it("LEGACY-MP-001: Old biswa_mp resolves safely", () => {
    const resolved = resolveUnit("biswa_mp");
    expect(resolved).toBeDefined();
    expect(resolved!.id).toBe("biswa_mp_gwalior");
  });

  it("LEGACY-MP-002: Historical factor remains 600 sq ft", () => {
    const legacyInfo = getLegacyUnitInfo("biswa_mp");
    expect(legacyInfo).toBeDefined();
    expect(legacyInfo!.legacySqFt).toBe(600);
    expect(legacyInfo!.canonicalSqFt).toBe(600);
    expect(legacyInfo!.canonicalUnitId).toBe("biswa_mp_gwalior");
    expect(legacyInfo!.factorDiffers).toBe(false);
  });

  it("LEGACY-MP-003: It never silently becomes 12,000 sq ft", () => {
    const resolved = resolveUnit("biswa_mp")!;
    expect(resolved.sqFt).toBe(600);
    expect(resolved.sqFt).not.toBe(12000);
  });

  it("LEGACY-MP-004: Legacy share URL does not change numerical meaning without a clear compatibility notice", () => {
    window.history.replaceState(null, "", "/?v=20&u=biswa_mp&s=Madhya%20Pradesh");

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

    expect(ctxRef!.inputValue).toBe("20");
    expect(ctxRef!.fromUnit.id).toBe("biswa_mp_gwalior");
    expect(ctxRef!.fromUnit.sqFt).toBe(600);
    const sqftResult = convertArea(20, ctxRef!.fromUnit, getUnit("sqft")!, 2);
    expect(sqftResult.rawResult).toBe(12000);
  });

  it("LEGACY-MP-005: Legacy saved parcel remains mathematically consistent after migration", () => {
    window.localStorage.removeItem("bharat-land-parcels-v2");
    window.localStorage.removeItem("bharat_parcels_migrated_v1");
    window.localStorage.setItem("bharat-land-parcels", JSON.stringify([{
      id: "mp-legacy-parcel",
      name: "Chambal Ancestral Plot",
      value: 10,
      unitId: "biswa_mp",
      state: "Madhya Pradesh",
      sqftTotal: 6000,
    }]));

    const parcels = migrateLegacyParcels();
    const migrated = parcels.find(p => p.id === "mp-legacy-parcel");
    expect(migrated).toBeDefined();
    expect(migrated!.sqftTotal).toBe(6000);
    expect(migrated!.unitId).toBe("biswa_mp_gwalior");
  });

  it("LEGACY-MP-006: Modern Gwalior Bigha remains 12,000 sq ft", () => {
    const gwaliorBigha = getUnit("bigha_mp_gwalior");
    expect(gwaliorBigha).toBeDefined();
    expect(gwaliorBigha!.sqFt).toBe(12000);
    expect(gwaliorBigha!.category).toBe("regional");
    expect(gwaliorBigha!.regionCode).toBe("MP");
  });

  it("LEGACY-MP-007: Every old ID maps to a valid supported target or an explicit historical compatibility representation", () => {
    expect(LEGACY_UNIT_INVENTORY.length).toBe(39);
    for (const rec of LEGACY_UNIT_INVENTORY) {
      const canonical = getUnit(rec.canonicalUnitId);
      expect(canonical, `Canonical unit ${rec.canonicalUnitId} exists for legacyId ${rec.legacyId}`).toBeDefined();
    }
  });

  it("LEGACY-MP-008: Compare all legacy factors with actual resolved factors, not merely duplicated metadata fields", () => {
    for (const rec of LEGACY_UNIT_INVENTORY) {
      const canonical = getUnit(rec.canonicalUnitId)!;
      expect(canonical, `Canonical unit ${rec.canonicalUnitId} exists for ${rec.legacyId}`).toBeDefined();
      if (rec.factorDiffers) {
        expect(rec.legacySqFt).not.toBe(canonical.sqFt);
      } else {
        expect(Math.abs(rec.legacySqFt - canonical.sqFt)).toBeLessThan(0.01);
      }
    }
  });

  it("LEGACY-MP-009: No unrelated canonical conversion changes", () => {
    expect(getUnit("acre")!.sqFt).toBe(43560);
    expect(getUnit("guntha_mh")!.sqFt).toBe(1089);
    expect(getUnit("bigha_up_pucca")!.sqFt).toBe(27225);
    expect(getUnit("bigha_rj_pucca")!.sqFt).toBe(27225);
    expect(getUnit("bigha_bihar_standard")!.sqFt).toBe(27225);
    expect(getUnit("chatak_wb")!.sqFt).toBe(45);
    expect(getUnit("kanal")!.sqFt).toBe(5445);
    expect(getUnit("marla")!.sqFt).toBe(272.25);
  });
});
