// Utilities to present the final score and show contributions clearly.

export function humanLabel(tci: number): "Glass-Smooth" | "Mostly Smooth" | "Choppy" | "Rough" {
  if (tci >= 85) return "Glass-Smooth";
  if (tci >= 70) return "Mostly Smooth";
  if (tci >= 55) return "Choppy";
  return "Rough";
}

export function aircraftContribution(aircraftScore: number): number {
  // 40% weight → max +40
  return Math.round((aircraftScore * 40) / 100);
}

export function routeContribution(routeScore: number): number {
  // 60% weight → max +60
  return Math.round((routeScore * 60) / 100);
}

/** clamp to 0..100 */
export function clamp01(x: number) {
  return Math.max(0, Math.min(100, x));
}
