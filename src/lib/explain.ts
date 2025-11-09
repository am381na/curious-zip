import type { TCIResult } from "./scoring";

export function humanLabel(tci: number): "Glass-Smooth" | "Mostly Smooth" | "Choppy" | "Rough" {
  if (tci >= 85) return "Glass-Smooth";
  if (tci >= 70) return "Mostly Smooth";
  if (tci >= 55) return "Choppy";
  return "Rough";
}

export function explainResult(r: TCIResult): string {
  const msgs: string[] = [];
  const { aircraft, route, season, realtime } = r.breakdown;

  if (aircraft >= 85) msgs.push("Best-in-class ride quality for this aircraft.");
  else if (aircraft >= 70) msgs.push("Modern airframe with good ride characteristics.");

  if (route >= 80) msgs.push("This path is usually calm.");
  else if (route >= 60) msgs.push("Route is typically manageable.");

  if (season >= 65) msgs.push("Seasonal winds are usually stable now.");
  else if (season < 45) msgs.push("Seasonal winds can add bumps.");

  if (realtime < 90) msgs.push("Jet-stream strength elevated today — expect light chop.");

  return msgs.slice(0, 2).join(" ");
}
