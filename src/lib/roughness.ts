import { MonthKey } from "./months";

/**
 * Accepts either { jan: number, feb: number, ... } or number[12]
 * and returns the month value safely.
 * Supports both array-based (current) and object-based (spec) formats.
 */
export function monthValue(
  source: Record<string, any> | number[],
  key: MonthKey
): number | undefined {
  if (!source) return undefined;

  // Named keys format: { "jan": 60, "feb": 55, ... }
  if (!Array.isArray(source) && typeof source === "object") {
    const v = (source as any)[key];
    return typeof v === "number" ? v : undefined;
  }

  // Array format: [15, 18, 20, ...] (indexed 0-11)
  if (Array.isArray(source) && source.length >= 12) {
    const monthKeys = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const idx = monthKeys.indexOf(key);
    if (idx >= 0) {
      const v = source[idx];
      return typeof v === "number" ? v : undefined;
    }
  }

  return undefined;
}
