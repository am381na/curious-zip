import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useSearchParams, useParams, useLocation } from "react-router-dom";
import { Plane, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { mockFlights, Flight } from "@/lib/mockFlights";
import { SmoothnessBadge } from "@/components/SmoothnesseBadge";
import { Skeleton } from "@/components/ui/skeleton";

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

                      {/* Smoothness Badge */}
                      <div className="flex flex-col items-center gap-2">
                        <SmoothnessBadge tci={flight.tci} bucket={flight.bucket} />
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
                            <div className="text-2xl font-bold text-foreground">{flight.breakdown.realtime}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              MVP placeholder
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
                          <strong className="text-foreground">TCI Formula:</strong> Aircraft (40%) + Route (60%)
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
