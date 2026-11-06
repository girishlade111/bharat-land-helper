/**
 * Bharat Land Converter — Conversion History & CSV Export Engine
 * 100% Client-Side Local Storage Persistence
 */

export interface ConversionHistoryItem {
  id: string;
  timestamp: string; // ISO 8601 string
  fromValue: number;
  fromUnitId: string;
  fromUnitName: string;
  toValue: number;
  toUnitId: string;
  toUnitName: string;
  formattedResult: string;
  stateCode: string;
  stateName: string;
  formula: string;
  isFavorite?: boolean;
}

export const HISTORY_STORAGE_KEY = "bharat_conversion_history_v1";
export const MAX_HISTORY_ITEMS = 50;

/**
 * Loads calculation history from browser localStorage safely.
 */
export function loadHistory(): ConversionHistoryItem[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.fromValue === "number" &&
          typeof item.toValue === "number",
      );
    }
    return [];
  } catch (err) {
    console.error("Failed to load conversion history:", err);
    return [];
  }
}

/**
 * Saves calculation history array to localStorage.
 */
export function saveHistory(items: ConversionHistoryItem[]): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)),
    );
  } catch (err) {
    console.error("Failed to save conversion history:", err);
  }
}

/**
 * Adds a new conversion record to history with deduplication.
 */
export function addHistoryItem(
  record: Omit<ConversionHistoryItem, "id" | "timestamp">,
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
    timestamp: now.toISOString(),
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
 * Escapes a cell value for safe RFC 4180 CSV generation.
 */
function escapeCsvCell(val: string | number | boolean | undefined): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates RFC 4180 compliant CSV string from history items.
 */
export function exportHistoryToCsv(items: ConversionHistoryItem[]): string {
  const headers = [
    "Timestamp (UTC)",
    "Date (Local)",
    "From Value",
    "From Unit",
    "To Value",
    "To Unit",
    "State / Region Context",
    "Formula / Conversion Rule",
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
      escapeCsvCell(item.timestamp),
      escapeCsvCell(localDateStr),
      escapeCsvCell(item.fromValue),
      escapeCsvCell(item.fromUnitName),
      escapeCsvCell(item.toValue),
      escapeCsvCell(item.toUnitName),
      escapeCsvCell(item.stateName),
      escapeCsvCell(item.formula),
      escapeCsvCell(item.isFavorite ? "Yes" : "No"),
    ].join(",");
  });

  const disclaimer =
    "# Disclaimer: Generated by Bharat Land Converter (https://land.ladestack.in). Traditional Indian land units vary locally. Verify with authorized revenue department survey before legal execution.";

  return [disclaimer, headers.map(escapeCsvCell).join(","), ...rows].join("\r\n");
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
