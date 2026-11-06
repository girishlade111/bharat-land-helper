/**
 * Bharat Land Converter — Conversion History & Secure CSV Export Engine
 * 100% Client-Side Local Storage Persistence with Schema Migration & OWASP CSV Injection Protection
 */

export type SnapshotProvenance =
  | "VERIFIED_SNAPSHOT"
  | "RECOVERED_FROM_STORED_RESULT"
  | "INFERRED_FROM_CURRENT_DEFINITION"
  | "ORIGINAL_CONTEXT_UNKNOWN";

export interface ConversionHistoryItem {
  id: string;
  dataVersion: "v1" | "v2";
  timestamp: string; // ISO 8601 string
  fromValue: number;
  fromUnitId: string;
  fromUnitName: string;
  fromUnitSqFtSnapshot?: number; // Exact sq ft factor at time of calculation
  toValue: number;
  toUnitId: string;
  toUnitName: string;
  toUnitSqFtSnapshot?: number; // Exact sq ft factor at time of calculation
  formattedResult: string;
  stateCode: string;
  stateName: string;
  district?: string;
  variantId?: string;
  formula: string;
  isCustomUnit?: boolean;
  customFactorSnapshot?: number;
  confidence?: string;
  sourceClassification?: string;
  snapshotProvenance?: SnapshotProvenance;
  isFavorite?: boolean;
}

export const HISTORY_STORAGE_KEY_V1 = "bharat_conversion_history_v1";
export const HISTORY_STORAGE_KEY_LEGACY_ALT = "bharat_calc_history_v1";
export const HISTORY_STORAGE_KEY_V2 = "bharat_conversion_history_v2";
export const MAX_HISTORY_ITEMS = 50;

// Known SI and Imperial standard multipliers for mathematical reconstruction
const FIXED_STANDARD_SQFT: Record<string, number> = {
  sqft: 1,
  sqyd: 9,
  acre: 43560,
  hectare: 107639.1041671,
  sqm: 10.76391041671,
};

/**
 * Migrates a legacy v1 history item to the schema v2 structure with audited snapshot provenance.
 * Never invents historical factors: categorizes provenance transparently.
 */
export function migrateV1Item(item: Record<string, unknown>): ConversionHistoryItem {
  const fromValue = Number(item.fromValue) || 0;
  const toValue = Number(item.toValue) || 0;
  const fromUnitId = String(item.fromUnitId || "acre");
  const toUnitId = String(item.toUnitId || "guntha_mh");

  let fromSnap = typeof item.fromUnitSqFtSnapshot === "number" ? item.fromUnitSqFtSnapshot : undefined;
  let toSnap = typeof item.toUnitSqFtSnapshot === "number" ? item.toUnitSqFtSnapshot : undefined;
  let provenance: SnapshotProvenance = (item.snapshotProvenance as SnapshotProvenance) || "ORIGINAL_CONTEXT_UNKNOWN";

  if (typeof fromSnap === "number" && typeof toSnap === "number") {
    provenance = "VERIFIED_SNAPSHOT";
  } else if (fromValue > 0 && toValue > 0) {
    // Attempt mathematical reconstruction if one unit is a fixed standard
    if (FIXED_STANDARD_SQFT[toUnitId] !== undefined) {
      toSnap = FIXED_STANDARD_SQFT[toUnitId];
      fromSnap = (toValue * toSnap) / fromValue;
      provenance = "RECOVERED_FROM_STORED_RESULT";
    } else if (FIXED_STANDARD_SQFT[fromUnitId] !== undefined) {
      fromSnap = FIXED_STANDARD_SQFT[fromUnitId];
      toSnap = (fromValue * fromSnap) / toValue;
      provenance = "RECOVERED_FROM_STORED_RESULT";
    } else {
      // Inferred from current definition registry if IDs resolve
      const currentFrom = getUnit(fromUnitId);
      const currentTo = getUnit(toUnitId);
      if (currentFrom && currentTo) {
        fromSnap = currentFrom.sqFt;
        toSnap = currentTo.sqFt;
        provenance = "INFERRED_FROM_CURRENT_DEFINITION";
      } else {
        provenance = "ORIGINAL_CONTEXT_UNKNOWN";
      }
    }
  } else {
    provenance = "ORIGINAL_CONTEXT_UNKNOWN";
  }

  return {
    id: String(item.id || `calc_${Date.now()}`),
    dataVersion: "v2",
    timestamp: typeof item.timestamp === "string" ? item.timestamp : new Date().toISOString(),
    fromValue,
    fromUnitId,
    fromUnitName: String(item.fromUnitName || "Acre"),
    fromUnitSqFtSnapshot: fromSnap,
    toValue,
    toUnitId,
    toUnitName: String(item.toUnitName || "Guntha"),
    toUnitSqFtSnapshot: toSnap,
    formattedResult: String(item.formattedResult || "0"),
    stateCode: String(item.stateCode || "MH"),
    stateName: String(item.stateName || "Maharashtra"),
    district: item.district ? String(item.district) : undefined,
    variantId: item.variantId ? String(item.variantId) : undefined,
    formula: String(item.formula || ""),
    isCustomUnit: Boolean(item.isCustomUnit || fromUnitId.startsWith("custom_")),
    customFactorSnapshot: typeof item.customFactorSnapshot === "number" ? item.customFactorSnapshot : undefined,
    confidence: item.confidence ? String(item.confidence) : "WIDELY_USED_CUSTOMARY",
    sourceClassification: item.sourceClassification ? String(item.sourceClassification) : "Customary Benchmark",
    snapshotProvenance: provenance,
    isFavorite: Boolean(item.isFavorite),
  };
}

/**
 * Loads calculation history from browser localStorage safely, performing transparent schema migration if needed.
 * Safely inspects v2, v1 legacy, and legacy alt keys, merging without duplicates.
 */
export function loadHistory(): ConversionHistoryItem[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const itemsMap = new Map<string, ConversionHistoryItem>();
    let needsSave = false;

    // 1. Try loading v2 primary storage
    const rawV2 = window.localStorage.getItem(HISTORY_STORAGE_KEY_V2);
    if (rawV2) {
      try {
        const parsed = JSON.parse(rawV2);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (
              item &&
              typeof item.id === "string" &&
              typeof item.fromValue === "number" &&
              typeof item.toValue === "number"
            ) {
              itemsMap.set(item.id, item.dataVersion === "v2" ? item : migrateV1Item(item));
            }
          });
        }
      } catch (err) {
        console.warn("Failed to parse v2 history item:", err);
      }
    }

    // 2. Check legacy v1 storage (bharat_conversion_history_v1)
    const rawV1 = window.localStorage.getItem(HISTORY_STORAGE_KEY_V1);
    if (rawV1) {
      try {
        const parsed = JSON.parse(rawV1);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (item && typeof item.id === "string" && !itemsMap.has(item.id)) {
              itemsMap.set(item.id, migrateV1Item(item));
              needsSave = true;
            }
          });
        }
      } catch (err) {
        console.warn("Failed to parse v1 legacy history item:", err);
      }
    }

    // 3. Check legacy alt storage (bharat_calc_history_v1)
    const rawAlt = window.localStorage.getItem(HISTORY_STORAGE_KEY_LEGACY_ALT);
    if (rawAlt) {
      try {
        const parsed = JSON.parse(rawAlt);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (item && typeof item.id === "string" && !itemsMap.has(item.id)) {
              itemsMap.set(item.id, migrateV1Item(item));
              needsSave = true;
            }
          });
        }
      } catch (err) {
        console.warn("Failed to parse legacy alt history item:", err);
      }
    }

    const merged = Array.from(itemsMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, MAX_HISTORY_ITEMS);

    if (needsSave && merged.length > 0) {
      saveHistory(merged);
    }

    return merged;
  } catch (err) {
    console.error("Failed to load conversion history:", err);
    return [];
  }
}

/**
 * Saves calculation history array to localStorage under v2 key.
 */
export function saveHistory(items: ConversionHistoryItem[]): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    const trimmed = items.slice(0, MAX_HISTORY_ITEMS);
    window.localStorage.setItem(HISTORY_STORAGE_KEY_V2, JSON.stringify(trimmed));
    // Also update v1 key for backward compatibility with older tabs
    window.localStorage.setItem(HISTORY_STORAGE_KEY_V1, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Failed to save conversion history:", err);
  }
}

/**
 * Adds a new conversion record to history with deduplication and snapshot capture.
 */
export function addHistoryItem(
  record: Omit<ConversionHistoryItem, "id" | "timestamp" | "dataVersion">,
): ConversionHistoryItem {
  const current = loadHistory();

  // Avoid duplicate log if same conversion was performed within last 3 seconds
  const now = new Date();
  if (current.length > 0) {
    const last = current[0];
    const timeDiff = now.getTime() - new Date(last.timestamp).getTime();
    if (
      timeDiff < 3000 &&
      last.fromValue === record.fromValue &&
      last.fromUnitId === record.fromUnitId &&
      last.toUnitId === record.toUnitId &&
      last.stateCode === record.stateCode
    ) {
      return last;
    }
  }

  const newItem: ConversionHistoryItem = {
    ...record,
    id: `calc_${now.getTime()}_${Math.random().toString(36).substring(2, 7)}`,
    dataVersion: "v2",
    timestamp: now.toISOString(),
    snapshotProvenance: record.snapshotProvenance || "VERIFIED_SNAPSHOT",
    isFavorite: false,
  };

  const updated = [newItem, ...current].slice(0, MAX_HISTORY_ITEMS);
  saveHistory(updated);
  return newItem;
}

/**
 * Toggles favorite flag for an item.
 */
export function toggleFavorite(id: string): ConversionHistoryItem[] {
  const items = loadHistory();
  const updated = items.map((item) =>
    item.id === id ? { ...item, isFavorite: !item.isFavorite } : item,
  );
  saveHistory(updated);
  return updated;
}

/**
 * Deletes a single item by id.
 */
export function deleteHistoryItem(id: string): ConversionHistoryItem[] {
  const items = loadHistory();
  const updated = items.filter((item) => item.id !== id);
  saveHistory(updated);
  return updated;
}

/**
 * Clears all non-favorite or all history.
 */
export function clearHistory(keepFavorites: boolean = false): ConversionHistoryItem[] {
  const items = loadHistory();
  const updated = keepFavorites ? items.filter((item) => item.isFavorite) : [];
  saveHistory(updated);
  return updated;
}

/**
 * Sanitizes a cell value for safe RFC 4180 CSV generation with OWASP CSV Injection protection.
 * Mitigates formula injection (starts with =, +, -, @, \t, or \r) while preserving numbers.
 */
export function sanitizeCsvField(val: string | number | boolean | undefined | null): string {
  if (val === undefined || val === null) return '""';

  // Format numbers directly without quoting if standard
  if (typeof val === "number") {
    if (isNaN(val) || !isFinite(val)) return '""';
    return String(val);
  }

  if (typeof val === "boolean") {
    return val ? '"Yes"' : '"No"';
  }

  let str = String(val);

  // OWASP CSV Injection mitigation:
  // If text starts with =, +, -, @, \t, or \r, prefix with a single quote (') so spreadsheets treat it as plain text.
  const rawFirstChar = str.charAt(0);
  const trimmed = str.trimStart();
  if (
    rawFirstChar === "\t" ||
    rawFirstChar === "\r" ||
    trimmed.startsWith("=") ||
    trimmed.startsWith("+") ||
    trimmed.startsWith("-") ||
    trimmed.startsWith("@")
  ) {
    str = `'${str}`;
  }

  // RFC 4180 Escaping: wrap in double quotes and escape internal quotes
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Generates RFC 4180 compliant CSV string from history items.
 * Includes UTF-8 Byte Order Mark (BOM) so Excel renders Hindi and Devanagari text cleanly.
 */
export function exportHistoryToCsv(items: ConversionHistoryItem[]): string {
  const headers = [
    "Timestamp (UTC)",
    "Date (IST / Local)",
    "From Value",
    "From Unit",
    "From Factor Snapshot (sq ft)",
    "To Value",
    "To Unit",
    "To Factor Snapshot (sq ft)",
    "State / Region Context",
    "Formula / Conversion Rule",
    "Custom Unit?",
    "Confidence Level",
    "Favorite",
  ];

  const rows = items.map((item) => {
    let localDateStr = "";
    try {
      localDateStr = new Date(item.timestamp).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      localDateStr = item.timestamp;
    }

    return [
      sanitizeCsvField(item.timestamp),
      sanitizeCsvField(localDateStr),
      sanitizeCsvField(item.fromValue),
      sanitizeCsvField(item.fromUnitName),
      sanitizeCsvField(item.fromUnitSqFtSnapshot ?? ""),
      sanitizeCsvField(item.toValue),
      sanitizeCsvField(item.toUnitName),
      sanitizeCsvField(item.toUnitSqFtSnapshot ?? ""),
      sanitizeCsvField(item.stateName),
      sanitizeCsvField(item.formula),
      sanitizeCsvField(item.isCustomUnit ? "Yes (Custom)" : "No (Statutory)"),
      sanitizeCsvField(item.confidence ?? "WIDELY_USED_CUSTOMARY"),
      sanitizeCsvField(item.isFavorite ? "Yes" : "No"),
    ].join(",");
  });

  const disclaimer =
    '# Disclaimer: Generated by Bharat Land Converter (https://land.ladestack.in). Non-certified informational export. Traditional Indian land units vary locally. Verify with authorized revenue department survey before legal execution.';

  // Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility with Devanagari / Unicode characters
  const UTF8_BOM = "\uFEFF";
  return UTF8_BOM + [disclaimer, headers.map(sanitizeCsvField).join(","), ...rows].join("\r\n");
}

/**
 * Initiates client-side CSV file download in browser.
 */
export function downloadHistoryCsv(
  items: ConversionHistoryItem[],
  filenamePrefix: string = "bharat_land_conversions",
): boolean {
  if (typeof window === "undefined" || !window.document) return false;
  try {
    const csvContent = exportHistoryToCsv(items);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `${filenamePrefix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("CSV download error:", err);
    return false;
  }
}
