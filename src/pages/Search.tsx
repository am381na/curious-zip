import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Plane, Search as SearchIcon } from "lucide-react";
import { useState } from "react";

const Search = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

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

  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrigin(e.target.value.toUpperCase());
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value.toUpperCase());
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
        </div>
      </header>

      {/* Search Form */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-4xl font-bold text-foreground">Search Flights</h2>
            <p className="text-muted-foreground">
              Enter your route details to find the smoothest flight options
            </p>
          </div>

          <Card className="rounded-2xl border-2 p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="origin" className="text-base font-medium">
                  Origin Airport (IATA Code)
                </Label>
                <Input
                  id="origin"
                  type="text"
                  placeholder="e.g., JFK"
                  value={origin}
                  onChange={handleOriginChange}
                  maxLength={3}
                  required
                  className="h-12 text-lg uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="text-base font-medium">
                  Destination Airport (IATA Code)
                </Label>
                <Input
                  id="destination"
                  type="text"
                  placeholder="e.g., LAX"
                  value={destination}
                  onChange={handleDestinationChange}
                  maxLength={3}
                  required
                  className="h-12 text-lg uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-base font-medium">
                  Departure Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="h-12 text-lg"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <Button type="submit" size="lg" className="w-full text-lg">
                <SearchIcon className="mr-2 h-5 w-5" />
                Search Flights
              </Button>
            </form>

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Tip:</strong> Try JFK → LAX, or MIA → BOG
              </p>
            </div>
          </Card>
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

export default Search;
