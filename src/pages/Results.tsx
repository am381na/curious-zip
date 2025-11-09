import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useSearchParams, useParams, useLocation } from "react-router-dom";
import { Plane, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { mockFlights, Flight } from "@/lib/mockFlights";
import { Skeleton } from "@/components/ui/skeleton";
import { computeConfidence } from "@/lib/confidence";
import { humanLabel, aircraftContribution, routeContribution, clamp01 } from "@/lib/present";
import { estimateRealtimePenalty } from "@/lib/realtime";
import { aircraftNote } from "@/lib/aircraftNotes";
import ScoringExplainer from "@/components/ScoringExplainer";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import AirlineBadge from "@/components/AirlineBadge";
import ThermoScore from "@/components/ThermoScore";
import SortBar, { SortKey } from "@/components/SortBar";
import { formatDuration } from "@/lib/format";

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
  const [filters, setFilters] = useState<FilterState>({
    smoothnessRange: [0, 100],
    airlines: [],
    stops: [],
    departureTime: [],
  });
  const [sortKey, setSortKey] = useState<SortKey>("smoothest");

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

  // Get unique airlines from flights
  const availableAirlines = useMemo(() => {
    return Array.from(new Set(flights.map((f) => f.airline))).sort();
  }, [flights]);

  // Apply filters to flights
  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      // Calculate adjusted TCI for filtering
      const aContrib = aircraftContribution(flight.breakdown.aircraft);
      const rContrib = routeContribution(flight.breakdown.route);
      const realtimeAdj = rtPenalty ?? 0;
      const tciAdjusted = clamp01(aContrib + rContrib - realtimeAdj);

      // Filter by smoothness range
      if (
        tciAdjusted < filters.smoothnessRange[0] ||
        tciAdjusted > filters.smoothnessRange[1]
      ) {
        return false;
      }

      // Filter by airline
      if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) {
        return false;
      }

      // Filter by stops (assuming all mock flights are nonstop for now)
      if (filters.stops.length > 0 && !filters.stops.includes("Nonstop")) {
        return false;
      }

      // Filter by departure time
      if (filters.departureTime.length > 0) {
        const departHour = new Date(flight.departTime).getHours();
        const timeOfDay =
          departHour >= 6 && departHour < 12
            ? "morning"
            : departHour >= 12 && departHour < 18
            ? "afternoon"
            : departHour >= 18 && departHour < 24
            ? "evening"
            : "night";
        if (!filters.departureTime.includes(timeOfDay)) {
          return false;
        }
      }

      return true;
    });
  }, [flights, filters, rtPenalty]);

  // Sort flights based on selected sort key
  const sortedFlights = useMemo(() => {
    return [...filteredFlights].sort((a, b) => {
      const aContrib = aircraftContribution(a.breakdown.aircraft);
      const rContrib = routeContribution(a.breakdown.route);
      const aTci = clamp01(aContrib + rContrib - (rtPenalty ?? 0));
      
      const bContribA = aircraftContribution(b.breakdown.aircraft);
      const bContribR = routeContribution(b.breakdown.route);
      const bTci = clamp01(bContribA + bContribR - (rtPenalty ?? 0));
      
      const aDuration = (new Date(a.arriveTime).getTime() - new Date(a.departTime).getTime()) / 60000;
      const bDuration = (new Date(b.arriveTime).getTime() - new Date(b.departTime).getTime()) / 60000;
      
      switch (sortKey) {
        case "cheapest":
          return a.price - b.price;
        case "earliest":
          return new Date(a.departTime).getTime() - new Date(b.departTime).getTime();
        case "shortest":
          return aDuration - bDuration;
        case "smoothest":
        default:
          return bTci - aTci;
      }
    });
  }, [filteredFlights, sortKey, rtPenalty]);

  // Calculate median price for "best choice" detection
  const medianPrice = useMemo(() => {
    const prices = flights.map(f => f.price).sort((a, b) => a - b);
    return prices[Math.floor(prices.length / 2)] ?? 0;
  }, [flights]);

  const isBestChoice = (flight: Flight, tciAdjusted: number) => {
    const rank = sortedFlights.findIndex(f => {
      const aContrib = aircraftContribution(f.breakdown.aircraft);
      const rContrib = routeContribution(f.breakdown.route);
      const fTci = clamp01(aContrib + rContrib - (rtPenalty ?? 0));
      return fTci === tciAdjusted;
    });
    const isTop10 = rank >= 0 && rank <= Math.max(0, Math.floor(sortedFlights.length * 0.1));
    const isGoodPrice = flight.price <= medianPrice;
    return isTop10 && isGoodPrice;
  };

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

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-4">
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                availableAirlines={availableAirlines}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">

            {/* Sort controls and results count */}
            {!loading && !error && filteredFlights.length > 0 && (
              <>
                <SortBar value={sortKey} onChange={setSortKey} />
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredFlights.length} of {flights.length} flights
                </div>
              </>
            )}

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

        {/* No Results After Filtering */}
        {!loading && !error && flights.length > 0 && filteredFlights.length === 0 && (
          <Card className="rounded-xl p-12 text-center">
            <p className="mb-4 text-lg text-muted-foreground">
              No flights match your filters. Try adjusting your criteria.
            </p>
            <Button onClick={() => setFilters({
              smoothnessRange: [0, 100],
              airlines: [],
              stops: [],
              departureTime: [],
            })}>
              Clear Filters
            </Button>
          </Card>
        )}

        {/* Flights List */}
        {!loading && !error && sortedFlights.length > 0 && (
          <div className="space-y-4">
            {sortedFlights.map((flight) => {
              const flightId = `${flight.flightNumber}-${flight.departTime}`;
              const isExpanded = expandedFlights.has(flightId);

              // Calculate contributions
              const aContrib = aircraftContribution(flight.breakdown.aircraft);
              const rContrib = routeContribution(flight.breakdown.route);
              const realtimeAdj = rtPenalty ?? 0;
              const tciAdjusted = clamp01(aContrib + rContrib - realtimeAdj);
              const label = humanLabel(tciAdjusted);
              const conf = computeConfidence(date, rtPenalty != null);
              const durationMin = (new Date(flight.arriveTime).getTime() - new Date(flight.departTime).getTime()) / 60000;

              return (
                <Card key={flightId} className="overflow-hidden rounded-xl border-2 transition-all hover:shadow-lg">
                  <div className="p-6">
                    {/* Optional Best Choice ribbon */}
                    {isBestChoice(flight, tciAdjusted) && (
                      <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        ⭐ Best balance of comfort & price
                      </div>
                    )}

                    {/* Top row: airline • stops • aircraft */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <AirlineBadge name={flight.airline} size={28} showName={false} />
                        <span className="font-medium text-neutral-900">{flight.airline}</span>
                        <span>• Nonstop</span>
                        <span>• {flight.aircraftIcao}</span>
                      </div>
                    </div>

                    {/* Times + duration + score + price */}
                    <div className="flex items-end justify-between gap-4 mb-2">
                      <div className="flex items-baseline gap-3">
                        <div className="text-lg font-semibold">{formatTime(flight.departTime)}</div>
                        <span className="text-neutral-400">→</span>
                        <div className="text-lg font-semibold">{formatTime(flight.arriveTime)}</div>
                        <div className="text-sm text-neutral-600">
                          ({formatDuration(durationMin)})
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <ThermoScore
                          score={tciAdjusted}
                          label={label}
                          width={140}
                          height={10}
                        />
                        <div className="text-right">
                          <div className="text-xl font-semibold">${flight.price}</div>
                          <div className="text-xs text-neutral-500">per person</div>
                        </div>
                      </div>
                    </div>

                    {/* Confidence + quick feel sentence */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs rounded-full bg-neutral-100 px-2 py-0.5">
                        Confidence: {conf}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {tciAdjusted >= 85
                          ? "Glass-smooth; aisle seats fine."
                          : tciAdjusted >= 70
                          ? "Occasional light bumps; aisle OK."
                          : tciAdjusted >= 55
                          ? "Choppy; pick window over wing."
                          : "Rough; over-wing window strongly recommended."}
                      </div>
                    </div>

                    <p className="mt-1 text-xs text-neutral-500">
                      This score reflects expected in-seat ride comfort. All commercial flights are safe.
                    </p>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(flightId)}
                      className="mt-4 text-xs text-muted-foreground hover:text-foreground"
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

                    {/* Breakdown Details */}
                    {isExpanded && (
                      <div className="mt-6 border-t pt-6">
                        {/* HOW WE GOT THIS NUMBER */}
                        <div className="rounded-lg border bg-card/60 p-4">
                          <div className="text-xs font-semibold text-foreground mb-3">How we got {tciAdjusted}</div>
                          <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Aircraft contribution (40%)</span>
                              <div className="flex items-center gap-2">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${aContrib * 2}px` }}></div>
                                <span className="font-medium text-foreground">+{aContrib}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Route history (60%)</span>
                              <div className="flex items-center gap-2">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${rContrib * 2}px` }}></div>
                                <span className="font-medium text-foreground">+{rContrib}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Realtime adjustment</span>
                              <div className="flex items-center gap-2">
                                {realtimeAdj > 0 && (
                                  <div className="h-2 rounded-full bg-amber-500" style={{ width: `${realtimeAdj * 2}px` }}></div>
                                )}
                                <span className="font-medium text-foreground">−{realtimeAdj}</span>
                              </div>
                            </div>
                            <div className="border-t pt-2 flex items-center justify-between">
                              <span className="text-foreground">Total</span>
                              <span className="font-bold text-foreground text-lg">{tciAdjusted}</span>
                            </div>
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">
                            Realtime uses upper-air wind as a turbulence proxy (beta). If unavailable, no adjustment is applied.
                          </p>
                        </div>

                        {/* "Try this for smoother" hint */}
                        <p className="mt-4 text-sm text-muted-foreground">
                          {tciAdjusted >= 80
                            ? "Looks good. For ultra-smooth, pick A350/787 if available."
                            : flight.breakdown.route < 60
                              ? "Try a connection via a calmer hub to avoid the jet-stream core."
                              : "Try an earlier morning departure or a smoother aircraft (A350/787)."}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Scoring Explainer */}
        {!loading && !error && filteredFlights.length > 0 && <ScoringExplainer />}
          </div>
        </div>
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
