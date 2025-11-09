import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import airportsData from "@/data/airports.json";

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface AirportComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

const airports: Airport[] = airportsData;

export function AirportCombobox({
  value,
  onValueChange,
  placeholder = "Select airport...",
  id,
}: AirportComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedAirport = airports.find(
    (airport) => airport.code === value
  );

  const filteredAirports = useMemo(() => {
    if (!searchQuery) return airports;

    const query = searchQuery.toLowerCase().trim();
    
    return airports.filter((airport) => {
      const codeMatch = airport.code.toLowerCase().startsWith(query);
      const cityMatch = airport.city.toLowerCase().includes(query);
      const nameMatch = airport.name.toLowerCase().includes(query);
      
      return codeMatch || cityMatch || nameMatch;
    });
  }, [searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-12 w-full justify-between border-input bg-background text-left font-normal hover:bg-background hover:text-foreground"
        >
          {selectedAirport ? (
            <span className="font-medium uppercase">{selectedAirport.code}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search airport or city..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No airport found.</CommandEmpty>
            <CommandGroup>
              {filteredAirports.map((airport) => (
                <CommandItem
                  key={airport.code}
                  value={airport.code}
                  onSelect={() => {
                    onValueChange(airport.code);
                    setSearchQuery("");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === airport.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {airport.code} - {airport.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {airport.city}, {airport.country}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
