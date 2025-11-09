import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Plane, Gauge, CloudRain, Calendar } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">SmoothSky</h1>
          </div>
          <Link to="/search">
            <Button>Search Flights</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            Choose calmer flights.
          </h2>
          <p className="mb-12 text-lg text-muted-foreground md:text-xl">
            SmoothSky shows a <span className="font-semibold text-foreground">Smoothness Score</span> for each flight
            based on aircraft, route, seasonality, and near-term advisories. Pick the calmer option before you book.
          </p>

          <Link to="/search">
            <Button size="lg" className="mb-16 px-8 py-6 text-lg">
              Find Your Smooth Flight
            </Button>
          </Link>

          {/* Test Links for SSG Verification */}
          <div className="mb-12 rounded-lg bg-muted/30 p-4 text-left">
            <div className="mb-2 font-medium text-foreground">Test static pre-rendered pages:</div>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                <a href="/search" className="text-primary hover:underline">/search</a>
              </li>
              <li>
                <a href="/results/JFK-LAX/2026-01-10" className="text-primary hover:underline">
                  /results/JFK-LAX/2026-01-10
                </a>
              </li>
              <li>
                <a href="/results/MIA-BOG/2026-01-10" className="text-primary hover:underline">
                  /results/MIA-BOG/2026-01-10
                </a>
              </li>
            </ul>
          </div>

          {/* Score Inputs */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="rounded-2xl border-2 p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Plane className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Aircraft Comfort</h3>
              <p className="text-sm text-muted-foreground">
                Modern wide-body aircraft like the A350 and 787 provide smoother rides with advanced stabilization.
              </p>
            </Card>

            <Card className="rounded-2xl border-2 p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <CloudRain className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Route Smoothness</h3>
              <p className="text-sm text-muted-foreground">
                Historical turbulence data for specific routes helps predict typical conditions you'll encounter.
              </p>
            </Card>

            <Card className="rounded-2xl border-2 p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Seasonal Patterns</h3>
              <p className="text-sm text-muted-foreground">
                Weather patterns vary by season—winter months typically see more turbulence than summer.
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-card/50 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Informational only; turbulence can occur unexpectedly. Always follow crew instructions.
        </p>
      </footer>
    </div>
  );
};

export default Home;
