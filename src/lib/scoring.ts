import aircraftData from "@/data/aircraft.json";
import routeRoughnessData from "@/data/route_roughness.json";
import seasonalityData from "@/data/seasonality.json";
import { monthKey } from "./months";
import { monthValue } from "./roughness";

// Legacy interfaces for backward compatibility
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

// Spec-style interfaces
export type TCIInput = {
  origin: string;
  destination: string;
  date: string | Date;
  aircraftIcao: string;
  realtime?: { sigmet: boolean; pireps: number };
};

export type TCIBreakdown = {
  aircraft: number;
  route: number;
  season: number;
  realtime: number;
};

export type TCIResult = {
  tci: number;
  bucket: "Smooth" | "Moderate" | "Turbulent" | "Avoid";
  breakdown: TCIBreakdown;
};

const clamp = (value: number, min = 0, max = 100): number => {
  return Math.max(min, Math.min(max, value));
};

const bucket = (t: number): "Smooth" | "Moderate" | "Turbulent" | "Avoid" => {
  if (t >= 80) return "Smooth";
  if (t >= 60) return "Moderate";
  if (t >= 40) return "Turbulent";
  return "Avoid";
};

function routeRoughnessForMonth(
  origin: string,
  destination: string,
  d: Date
): number {
  const routeKey = `${origin.toUpperCase()}-${destination.toUpperCase()}`;
  const k = monthKey(d);
  const routeRow = (routeRoughnessData as any)[routeKey];
  const fromRoute = monthValue(routeRow, k);

  if (typeof fromRoute === "number") return fromRoute;

  // Fallback to seasonality baseline
  const seasonalData = (seasonalityData as any).months;
  if (Array.isArray(seasonalData)) {
    // Current format: array of { month: number, roughness: number }
    const monthNum = d.getUTCMonth() + 1; // 1-12
    const seasonalEntry = seasonalData.find((m: any) => m.month === monthNum);
    if (seasonalEntry && typeof seasonalEntry.roughness === "number") {
      return seasonalEntry.roughness;
    }
  } else {
    // Future format: { "jan": number, ... }
    const base = monthValue(seasonalData, k);
    if (typeof base === "number") return base;
  }

  return 25; // Default fallback
}

/**
 * Spec-style function: accepts object parameter
 */
export function computeTCI(input: TCIInput): TCIResult {
  const d = new Date(input.date);
  const aircraft = clamp(
    (aircraftData as Record<string, number>)[input.aircraftIcao.toUpperCase()] ?? 60
  );

  const roughness = routeRoughnessForMonth(input.origin, input.destination, d);
  const route = clamp(100 - Number(roughness));

  const k = monthKey(d);
  const seasonalData = (seasonalityData as any).months;
  let seasonalRoughness = 25;

  if (Array.isArray(seasonalData)) {
    const monthNum = d.getUTCMonth() + 1;
    const seasonalEntry = seasonalData.find((m: any) => m.month === monthNum);
    if (seasonalEntry && typeof seasonalEntry.roughness === "number") {
      seasonalRoughness = seasonalEntry.roughness;
    }
  } else {
    const base = monthValue(seasonalData, k);
    seasonalRoughness = typeof base === "number" ? base : 25;
  }

  const season = clamp(100 - seasonalRoughness);

  let realtimeScore = 100;
  if (input.realtime) {
    if (input.realtime.sigmet) realtimeScore -= 25;
    realtimeScore -= Math.min((input.realtime.pireps ?? 0) * 3, 20);
  }
  realtimeScore = clamp(realtimeScore);

  const hasRT = !!input.realtime;
  const wA = 0.4;
  const wR = hasRT ? 0.45 : 0.6;
  const wT = hasRT ? 0.15 : 0.0;

  const tci = Math.round(aircraft * wA + route * wR + realtimeScore * wT);
  const finalTci = clamp(tci);

  return {
    tci: finalTci,
    bucket: bucket(finalTci),
    breakdown: {
      aircraft,
      route,
      season,
      realtime: realtimeScore,
    },
  };
}

/**
 * Backward-compatible wrapper with the current signature:
 * (aircraftIcao, origin, destination, date, realtimePenalty?)
 */
export function computeTCI_legacy(
  aircraftIcao: string,
  origin: string,
  destination: string,
  date: string,
  realtimePenalty = 0
): ScoringResult {
  const realtime =
    realtimePenalty > 0
      ? {
          sigmet: realtimePenalty >= 25,
          pireps: Math.max(0, Math.round(realtimePenalty / 3)),
        }
      : undefined;

  return computeTCI({ origin, destination, date, aircraftIcao, realtime });
}
