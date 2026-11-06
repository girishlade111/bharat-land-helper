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
import { render, screen, act } from "@testing-library/react";
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

  it("REM-009: Unkeyed AppProvider would fail to reinitialize props on route change", () => {
    function TestConsumer() {
      const { selectedRegion } = useApp();
      return <span data-testid="region">{selectedRegion.code}</span>;
    }

    // Without key, React reuses same provider state
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
    // Notice: without key, useState initial value is ignored on rerender!
    expect(screen.getByTestId("region").textContent).toBe("MH");
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
});
