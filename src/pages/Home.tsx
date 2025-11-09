import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Plane, CloudRain, Calendar, ArrowLeftRight, Users, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { AirportCombobox } from "@/components/AirportCombobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Home = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [tripType, setTripType] = useState("one-way");
  const [passengers, setPassengers] = useState("1");
  const [travelClass, setTravelClass] = useState("economy");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origin || !destination || !date) {
      return;
    }

    const params = new URLSearchParams({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      date,
    });

    navigate(`/results?${params.toString()}`);
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

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

          {/* Search Form */}
          <div className="mb-16">
            <div className="mb-8 text-left">
              <h3 className="text-3xl font-semibold text-foreground">Flights</h3>
            </div>

            <Card className="rounded-xl border bg-card p-6 shadow-lg">
              <form onSubmit={handleSubmit}>
                {/* Trip Type and Passenger Selectors */}
                <div className="mb-6 flex flex-wrap items-center gap-4">
                  <Select value={tripType} onValueChange={setTripType}>
                    <SelectTrigger className="w-[140px] border-0 font-medium hover:bg-accent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-way">One-way</SelectItem>
                      <SelectItem value="round-trip">Round trip</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger className="w-[140px] border-0 font-medium hover:bg-accent">
                      <Users className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 passenger</SelectItem>
                      <SelectItem value="2">2 passengers</SelectItem>
                      <SelectItem value="3">3 passengers</SelectItem>
                      <SelectItem value="4">4 passengers</SelectItem>
                      <SelectItem value="5">5+ passengers</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={travelClass} onValueChange={setTravelClass}>
                    <SelectTrigger className="w-[140px] border-0 font-medium hover:bg-accent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="premium">Premium economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first">First class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Main Search Fields */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  {/* Origin and Destination Container */}
                  <div className="flex flex-1 items-center gap-2">
                    <div className="flex-1">
                      <AirportCombobox
                        id="origin"
                        value={origin}
                        onValueChange={setOrigin}
                        placeholder="Where from?"
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleSwap}
                      className="shrink-0 rounded-full hover:bg-accent"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>

                    <div className="flex-1">
                      <AirportCombobox
                        id="destination"
                        value={destination}
                        onValueChange={setDestination}
                        placeholder="Where to?"
                      />
                    </div>
                  </div>

                  {/* Date Field */}
                  <div className="w-full lg:w-48">
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="h-12"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  {/* Search Button */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="h-12 px-8 text-base font-medium"
                  >
                    <SearchIcon className="mr-2 h-5 w-5" />
                    Explore
                  </Button>
                </div>
              </form>

              <div className="mt-6 rounded-lg bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Tip:</strong> Try popular routes like JFK → LAX, MIA → BOG, or MDE → BOG
                </p>
              </div>
            </Card>
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
