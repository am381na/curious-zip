import aircraftData from "@/data/aircraft.json";
import routeRoughnessData from "@/data/route_roughness.json";
import seasonalityData from "@/data/seasonality.json";

export interface ScoringBreakdown {
  aircraft: number;
  route: number;
  season: number;
  realtime: number;
}

export interface ScoringResult {
  tci: number;
  bucket: "Smooth" | "Moderate" | "Turbulent" | "Avoid";
  breakdown: ScoringBreakdown;
}

const clamp = (value: number, min = 0, max = 100): number => {
  return Math.max(min, Math.min(max, value));
};

export const computeTCI = (
  aircraftIcao: string,
  origin: string,
  destination: string,
  date: string,
  realtimePenalty = 0
): ScoringResult => {
  // Get aircraft score
  const aircraftScore = clamp(
    (aircraftData as Record<string, number>)[aircraftIcao.toUpperCase()] ?? 60
  );

  // Get month from date (0-indexed)
  const dateObj = new Date(date);
  const month = dateObj.getMonth(); // 0-11

  // Get route roughness
  const routeKey = `${origin.toUpperCase()}-${destination.toUpperCase()}`;
  const routeRoughness =
    (routeRoughnessData as Record<string, number[]>)[routeKey]?.[month];

  // Calculate route score
  let routeScore: number;
  if (routeRoughness !== undefined) {
    routeScore = clamp(100 - routeRoughness);
  } else {
    // Fallback to seasonality
    const seasonalRoughness =
      seasonalityData.months.find((m) => m.month === month + 1)?.roughness ?? 25;
    routeScore = clamp(100 - seasonalRoughness);
  }

  // Season score (for breakdown display)
  const seasonalRoughness =
    seasonalityData.months.find((m) => m.month === month + 1)?.roughness ?? 25;
  const seasonScore = clamp(100 - seasonalRoughness);

  // Realtime score (MVP: placeholder, always 100)
  const realtimeScore = clamp(100 - realtimePenalty);

  // Calculate TCI (MVP weights: aircraft 40%, route 60%)
  const tci = Math.round(aircraftScore * 0.4 + routeScore * 0.6);

  // Determine bucket
  let bucket: "Smooth" | "Moderate" | "Turbulent" | "Avoid";
  if (tci >= 80) bucket = "Smooth";
  else if (tci >= 60) bucket = "Moderate";
  else if (tci >= 40) bucket = "Turbulent";
  else bucket = "Avoid";

  return {
    tci: clamp(tci),
    bucket,
    breakdown: {
      aircraft: aircraftScore,
      route: routeScore,
      season: seasonScore,
      realtime: realtimeScore,
    },
  };
};
