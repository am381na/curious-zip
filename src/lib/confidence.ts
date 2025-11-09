export type Confidence = "High" | "Medium" | "Low";

export function computeConfidence(date: string | Date, hasRealtime: boolean): Confidence {
  const d = new Date(date);
  const now = new Date();
  const daysAhead = Math.max(0, Math.round((+d - +now) / (24 * 3600 * 1000)));

  if (daysAhead <= 3) return "High";
  if (daysAhead <= 10) return hasRealtime ? "Medium" : "Low";
  return "Low";
}
