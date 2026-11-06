import type { Lang } from "@/data/translations";

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

  // Custom unit snapshot parameters (for portable cross-browser sharing)
  if (state.fromSqFt && state.fromUnitId && (state.fromUnitId.startsWith("custom") || state.fromUnitId === "custom")) {
    params.set("from_sqft", String(state.fromSqFt));
    if (state.fromName) {
      params.set("from_name", state.fromName);
    }
  } else {
    params.delete("from_sqft");
    params.delete("from_name");
  }

  if (state.toSqFt && state.toUnitId && (state.toUnitId.startsWith("custom") || state.toUnitId === "custom")) {
    params.set("to_sqft", String(state.toSqFt));
    if (state.toName) {
      params.set("to_name", state.toName);
    }
  } else {
    params.delete("to_sqft");
    params.delete("to_name");
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

