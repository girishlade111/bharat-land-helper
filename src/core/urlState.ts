import type { Lang } from "@/data/translations";
import { parseStrictCustomFactor } from "./customUnits";

export interface ConversionQueryState {
  value?: string;
  fromUnitId?: string;
  toUnitId?: string;
  regionCode?: string;
  lang?: Lang;
  fromSqFt?: number;
  fromName?: string;
  toSqFt?: number;
  toName?: string;
}

export interface ConversionQueryDefaults {
  defaultValue?: string;
  defaultFromUnitId?: string;
  defaultToUnitId?: string;
  defaultRegionCode?: string;
  defaultLang?: Lang;
}

/**
 * Builds canonical query search string for Bharat Land Converter URLs.
 * Omits parameters matching default values to keep URLs clean and canonical.
 * Preserves existing non-conversion parameters if baseSearch is provided.
 */
export function buildConversionSearchParams(
  state: ConversionQueryState,
  baseSearch?: string,
  defaults?: ConversionQueryDefaults
): string {
  const params = new URLSearchParams(baseSearch || "");

  const defVal = defaults?.defaultValue ?? "1";
  const defFrom = defaults?.defaultFromUnitId ?? "acre";
  const defRegion = defaults?.defaultRegionCode ?? "MH";

  // Value: set only if defined and non-default
  if (state.value !== undefined && state.value !== "" && state.value !== defVal) {
    params.set("v", state.value);
  } else {
    params.delete("v");
  }

  // Source unit: set only if non-default
  if (state.fromUnitId && state.fromUnitId !== defFrom) {
    params.set("from", state.fromUnitId);
    params.delete("u"); // clean legacy alias
  } else {
    params.delete("from");
    params.delete("u");
  }

  // Target unit: set only if defined and non-default
  if (state.toUnitId && (!defaults?.defaultToUnitId || state.toUnitId !== defaults.defaultToUnitId)) {
    params.set("to", state.toUnitId);
  } else if (defaults?.defaultToUnitId && state.toUnitId === defaults.defaultToUnitId) {
    params.delete("to");
  }

  // Region: set only if non-default
  if (state.regionCode && state.regionCode !== defRegion) {
    params.set("s", state.regionCode);
  } else {
    params.delete("s");
  }

  // Language: removed if using route-level prefixes (/hi, /mr) unless explicit
  if (state.lang && defaults?.defaultLang && state.lang !== defaults.defaultLang) {
    params.set("lang", state.lang);
  } else {
    params.delete("lang");
  }

  // Source unit custom snapshot serialization and legacy alias normalization
  const existingFromSqFt = params.get("from_sqft") || params.get("c_from_sqft");
  const existingFromName = params.get("from_name") || params.get("c_from_name");
  params.delete("c_from_sqft");
  params.delete("c_from_name");

  const isCustomFrom = Boolean(
    state.fromUnitId && (state.fromUnitId.startsWith("custom") || state.fromUnitId === "custom")
  );

  if (isCustomFrom) {
    const rawSqFt = state.fromSqFt !== undefined ? state.fromSqFt : existingFromSqFt;
    const parsed = parseStrictCustomFactor(rawSqFt);
    if (parsed.isValid && parsed.value > 0) {
      params.set("from_sqft", String(parsed.value));
      const rawName = state.fromName !== undefined ? state.fromName : existingFromName;
      if (rawName && rawName.trim()) {
        params.set("from_name", rawName.trim());
      } else {
        params.delete("from_name");
      }
    } else {
      params.delete("from_sqft");
      params.delete("from_name");
    }
  } else {
    params.delete("from_sqft");
    params.delete("from_name");
  }

  // Target unit custom snapshot serialization and legacy alias normalization
  const existingToSqFt = params.get("to_sqft") || params.get("c_to_sqft");
  const existingToName = params.get("to_name") || params.get("c_to_name");
  params.delete("c_to_sqft");
  params.delete("c_to_name");

  const effectiveToUnitId = state.toUnitId !== undefined ? state.toUnitId : params.get("to") || undefined;
  const isCustomTo = Boolean(
    effectiveToUnitId && (effectiveToUnitId.startsWith("custom") || effectiveToUnitId === "custom")
  );

  if (isCustomTo) {
    const rawSqFt = state.toSqFt !== undefined ? state.toSqFt : existingToSqFt;
    const parsed = parseStrictCustomFactor(rawSqFt);
    if (parsed.isValid && parsed.value > 0) {
      params.set("to_sqft", String(parsed.value));
      const rawName = state.toName !== undefined ? state.toName : existingToName;
      if (rawName && rawName.trim()) {
        params.set("to_name", rawName.trim());
      } else {
        params.delete("to_name");
      }
    } else {
      params.delete("to_sqft");
      params.delete("to_name");
    }
  } else {
    params.delete("to_sqft");
    params.delete("to_name");
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

