import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useSearchParams, useParams, useLocation } from "react-router-dom";
import { Plane, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { mockFlights, Flight } from "@/lib/mockFlights";
import { SmoothnessBadge } from "@/components/SmoothnesseBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { computeConfidence } from "@/lib/confidence";
import { humanLabel, explainResult } from "@/lib/explain";
import { estimateRealtimePenalty } from "@/lib/realtime";

// Minimal IATA → lat/lon map
const IATA: Record<string, { lat: number; lon: number; city?: string }> = {
  LAX: { lat: 33.9425, lon: -118.4081, city: "Los Angeles" },
  LHR: { lat: 51.4700, lon: -0.4543, city: "London" },
  JFK: { lat: 40.6413, lon: -73.7781, city: "New York" },
  MIA: { lat: 25.7959, lon: -80.2870, city: "Miami" },
  BOG: { lat: 4.7016, lon: -74.1469, city: "Bogotá" },
  ATL: { lat: 33.6407, lon: -84.4277, city: "Atlanta" },
  ORD: { lat: 41.9742, lon: -87.9073, city: "Chicago" },
  DFW: { lat: 32.8998, lon: -97.0403, city: "Dallas" },
  DEN: { lat: 39.8561, lon: -104.6737, city: "Denver" },
  SFO: { lat: 37.6213, lon: -122.3790, city: "San Francisco" },
  SEA: { lat: 47.4502, lon: -122.3088, city: "Seattle" },
  LAS: { lat: 36.0840, lon: -115.1537, city: "Las Vegas" },
  MCO: { lat: 28.4312, lon: -81.3081, city: "Orlando" },
  EWR: { lat: 40.6895, lon: -74.1745, city: "Newark" },
  MSP: { lat: 44.8820, lon: -93.2218, city: "Minneapolis" },
  BOS: { lat: 42.3656, lon: -71.0096, city: "Boston" },
  PHL: { lat: 39.8729, lon: -75.2437, city: "Philadelphia" },
  PHX: { lat: 33.4352, lon: -112.0101, city: "Phoenix" },
  IAH: { lat: 29.9902, lon: -95.3368, city: "Houston" },
  CLT: { lat: 35.2144, lon: -80.9473, city: "Charlotte" },
  CDG: { lat: 49.0097, lon: 2.5479, city: "Paris" },
  AMS: { lat: 52.3105, lon: 4.7683, city: "Amsterdam" },
  FRA: { lat: 50.0379, lon: 8.5622, city: "Frankfurt" },
  MAD: { lat: 40.4983, lon: -3.5676, city: "Madrid" },
  BCN: { lat: 41.2974, lon: 2.0833, city: "Barcelona" },
  FCO: { lat: 41.8003, lon: 12.2389, city: "Rome" },
  IST: { lat: 40.9769, lon: 28.8146, city: "Istanbul" },
  DXB: { lat: 25.2532, lon: 55.3657, city: "Dubai" },
  SIN: { lat: 1.3644, lon: 103.9915, city: "Singapore" },
  HKG: { lat: 22.3080, lon: 113.9185, city: "Hong Kong" },
  NRT: { lat: 35.7653, lon: 140.3863, city: "Tokyo" },
  ICN: { lat: 37.4602, lon: 126.4407, city: "Seoul" },
  SYD: { lat: -33.9399, lon: 151.1753, city: "Sydney" },
  MEL: { lat: -37.6690, lon: 144.8410, city: "Melbourne" },
  YYZ: { lat: 43.6777, lon: -79.6248, city: "Toronto" },
  YVR: { lat: 49.1967, lon: -123.1815, city: "Vancouver" },
  GRU: { lat: -23.4356, lon: -46.4731, city: "São Paulo" },
  MEX: { lat: 19.4363, lon: -99.0721, city: "Mexico City" },
  MDE: { lat: 6.1698, lon: -75.4233, city: "Medellín" },
};

const Results = () => {
  const location = useLocation();
  const params = useParams<{ od?: string; date?: string }>();
  const [searchParams] = useSearchParams();
  
  // Support both query params (?origin=X&destination=Y) and path params (/results/X-Y/date)
  const origin = (
    searchParams.get("origin") ||
    (params.od ? params.od.split("-")[0] : "")
  ).toUpperCase();
  
  const destination = (
    searchParams.get("destination") ||
    (params.od ? params.od.split("-")[1] : "")
  ).toUpperCase();
  
  const date = searchParams.get("date") || params.date || "";

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedFlights, setExpandedFlights] = useState<Set<string>>(new Set());
  const [rtPenalty, setRtPenalty] = useState<number | null>(null);

  useEffect(() => {
    if (!origin || !destination || !date) {
      setError(true);
      setLoading(false);
      return;
    }

    // Simulate API call
    setLoading(true);
    setError(false);

    setTimeout(() => {
      try {
        const mockData = mockFlights(origin, destination, date);
        setFlights(mockData);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 800);
  }, [origin, destination, date]);

  // Fetch real-time wind penalty
  useEffect(() => {
    const o = IATA[origin], d = IATA[destination];
    if (!o || !d) { 
      setRtPenalty(null); 
      return; 
    }
    estimateRealtimePenalty({
      origin: { lat: o.lat, lon: o.lon },
      destination: { lat: d.lat, lon: d.lon },
      dateISO: date
    }).then(setRtPenalty).catch(() => setRtPenalty(null));
  }, [origin, destination, date]);

  const toggleExpanded = (flightId: string) => {
    setExpandedFlights((prev) => {
      const next = new Set(prev);
      if (next.has(flightId)) {
        next.delete(flightId);
      } else {
        next.add(flightId);
      }
      return next;
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">SmoothSky</h1>
          </Link>
          <Link to="/search">
            <Button variant="outline">New Search</Button>
          </Link>
        </div>
      </header>

      {/* Results */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="mb-2 text-3xl font-bold text-foreground">
            {origin} → {destination}
          </h2>
          <p className="text-muted-foreground">
            {date && new Date(date).toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-12 w-32 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="rounded-xl p-12 text-center">
            <p className="mb-4 text-lg text-destructive">Search failed. Try again.</p>
            <Link to="/search">
              <Button>Back to Search</Button>
            </Link>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && flights.length === 0 && (
          <Card className="rounded-xl p-12 text-center">
            <p className="mb-4 text-lg text-muted-foreground">No flights found. Try a different date.</p>
            <Link to="/search">
              <Button>Back to Search</Button>
            </Link>
          </Card>
        )}

        {/* Flights List */}
        {!loading && !error && flights.length > 0 && (
          <div className="space-y-4">
            {flights.map((flight) => {
              const flightId = `${flight.flightNumber}-${flight.departTime}`;
              const isExpanded = expandedFlights.has(flightId);

              // Post-adjust TCI based on real-time penalty
              const appliedPenalty = rtPenalty ?? 0;
              const tciAdjusted = Math.max(0, Math.min(100, flight.tci - appliedPenalty));
              const bucketAdjusted = humanLabel(tciAdjusted);
              const confidence = computeConfidence(date, rtPenalty != null);

              return (
                <Card key={flightId} className="overflow-hidden rounded-xl border-2 transition-all hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      {/* Flight Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-foreground">{flight.airline}</h3>
                          <span className="rounded-md bg-muted px-2 py-1 text-sm font-mono font-semibold">
                            {flight.flightNumber}
                          </span>
                          <span className="rounded-md bg-muted px-2 py-1 text-sm font-mono">
                            {flight.aircraftIcao}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-lg">
                          <div>
                            <div className="font-bold text-foreground">{formatTime(flight.departTime)}</div>
                            <div className="text-sm text-muted-foreground">{flight.origin}</div>
                          </div>
                          <div className="flex-1 text-center text-muted-foreground">→</div>
                          <div className="text-right">
                            <div className="font-bold text-foreground">{formatTime(flight.arriveTime)}</div>
                            <div className="text-sm text-muted-foreground">{flight.destination}</div>
                          </div>
                        </div>
                      </div>

                      {/* Smoothness Badge & Chips */}
                      <div className="flex flex-col items-end gap-3">
                        {/* Score chips row */}
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <div className="rounded-full border border-border bg-background px-3 py-1 text-sm font-semibold">
                            {tciAdjusted} · {humanLabel(tciAdjusted)}
                          </div>
                          <div className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium">
                            Confidence: {confidence}
                          </div>
                          {rtPenalty != null && rtPenalty > 0 && (
                            <div className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                              Realtime (beta): −{rtPenalty} pts
                            </div>
                          )}
                        </div>

                        {/* Short "felt experience" subline under the badge */}
                        <p className="text-sm text-muted-foreground text-right">
                          {tciAdjusted >= 85
                            ? "Glass-smooth; aisle seats fine."
                            : tciAdjusted >= 70
                            ? "Occasional light bumps; aisle OK."
                            : tciAdjusted >= 55
                            ? "Choppy; pick window over wing."
                            : "Rough; over-wing window strongly recommended."}
                        </p>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(flightId)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? (
                            <>
                              Hide Details <ChevronUp className="ml-1 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Why? <ChevronDown className="ml-1 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Breakdown Details */}
                    {isExpanded && (
                      <div className="mt-6 border-t pt-6">
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Score Breakdown
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Aircraft
                            </div>
                            <div className="text-2xl font-bold text-foreground">{flight.breakdown.aircraft}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {flight.aircraftIcao} comfort rating
                            </div>
                          </div>

                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Route
                            </div>
                            <div className="text-2xl font-bold text-foreground">{flight.breakdown.route}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Historical smoothness
                            </div>
                          </div>

                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Season
                            </div>
                            <div className="text-2xl font-bold text-foreground">{flight.breakdown.season}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {formatDate(flight.departTime)} conditions
                            </div>
                          </div>

                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Real-time
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {rtPenalty != null ? Math.max(0, 100 - rtPenalty) : 100}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {rtPenalty != null && rtPenalty > 0
                                ? `Realtime (beta): −${rtPenalty} pts`
                                : "No penalty applied"}
                            </div>
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-muted-foreground">
                          ({computeConfidence(date, rtPenalty != null)} forecast){" "}
                          {explainResult({ 
                            tci: tciAdjusted, 
                            bucket: humanLabel(tciAdjusted) as any, 
                            breakdown: flight.breakdown 
                          })}
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {tciAdjusted >= 80
                            ? "Looks good. For ultra-smooth, pick A350/787 if available."
                            : flight.breakdown.route < 60
                            ? "Try: route via a calmer hub to avoid the jet-stream core."
                            : flight.breakdown.season < 50
                            ? "Try: earlier morning departure to dodge peak winds."
                            : "Try: earlier morning departure or a smoother aircraft (A350/787)."}
                        </p>

                        <div className="mt-4 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
                          <strong className="text-foreground">TCI Formula:</strong> Aircraft (40%) + Route (60%)
                          <p className="mt-2">
                            TCI shown = Historical score ± Realtime (beta). Confidence is based on forecast horizon.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-card/50 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Informational only; turbulence can occur unexpectedly.
        </p>
      </footer>
    </div>
  );
};

export default Results;
