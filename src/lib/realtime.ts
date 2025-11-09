// Realtime "jet-stream penalty" MVP.
// If the fetch fails (CORS/network), return null and the UI will ignore realtime.

export type WindSample = { speedKts: number };

function midpoint(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const toDeg = (x: number) => (x * 180) / Math.PI;
  const φ1 = toRad(lat1), λ1 = toRad(lon1);
  const φ2 = toRad(lat2), λ2 = toRad(lon2);
  const Bx = Math.cos(φ2) * Math.cos(λ2 - λ1);
  const By = Math.cos(φ2) * Math.sin(λ2 - λ1);
  const φ3 = Math.atan2(
    Math.sin(φ1) + Math.sin(φ2),
    Math.sqrt((Math.cos(φ1) + Bx) ** 2 + By ** 2)
  );
  const λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);
  const normLon = ((toDeg(λ3) + 540) % 360) - 180;
  return { lat: +toDeg(φ3).toFixed(3), lon: +normLon.toFixed(3) };
}

export function jetstreamPenaltyFromKnots(kts: number): number {
  if (kts >= 120) return 15;
  if (kts >= 100) return 12;
  if (kts >= 80)  return 8;
  if (kts >= 60)  return 4;
  if (kts >= 40)  return 2;
  return 0;
}

export async function sampleWindNearMidpoint(opts: {
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  dateISO: string;        // YYYY-MM-DD
  hourUTC?: number;       // default 12Z
}): Promise<WindSample | null> {
  const { lat, lon } = midpoint(opts.origin.lat, opts.origin.lon, opts.destination.lat, opts.destination.lon);
  const date = opts.dateISO;
  const hour = (opts.hourUTC ?? 12).toString().padStart(2, "0");

  try {
    // Replace this with a small proxy (Cloudflare Worker or similar) when available.
    const url = `https://upper-wind-proxy.smoothsky.dev/300hpa?lat=${lat}&lon=${lon}&date=${date}&hour=${hour}`;
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json() as { u: number; v: number }; // m/s components
    const ms = Math.sqrt(j.u * j.u + j.v * j.v);
    const kts = ms * 1.94384;
    return { speedKts: kts };
  } catch {
    return null;
  }
}

export async function estimateRealtimePenalty(opts: {
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  dateISO: string;
}): Promise<{ penalty: number; windKts: number } | null> {
  const s = await sampleWindNearMidpoint(opts);
  if (!s) return null;
  return { 
    penalty: jetstreamPenaltyFromKnots(s.speedKts),
    windKts: Math.round(s.speedKts)
  };
}
