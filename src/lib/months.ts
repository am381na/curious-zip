export const MONTH_KEYS = [
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
] as const;

export type MonthKey = typeof MONTH_KEYS[number];

export const monthKey = (d: Date): MonthKey => MONTH_KEYS[d.getUTCMonth()];
