import React, { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getAirlineInfo } from "@/lib/airlineLogos";

export interface FilterState {
  smoothnessRange: [number, number];
  airlines: string[];
  stops: string[];
  departureTime: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (next: FilterState | ((prev: FilterState) => FilterState)) => void;
  availableAirlines: string[];
}

export const FilterSidebar = React.memo(function FilterSidebar({ filters, onFiltersChange, availableAirlines }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["smoothness", "airlines", "stops"])
  );

  // Local state for smooth slider dragging
  const [localRange, setLocalRange] = useState<[number, number]>(
    filters.smoothnessRange ?? [0, 100]
  );

  // Sync local state when external filters change
  useEffect(() => {
    setLocalRange(filters.smoothnessRange ?? [0, 100]);
  }, [filters.smoothnessRange]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Update local state during drag (no parent re-render)
  const handleSmoothnessChange = (value: number[]) => {
    setLocalRange([value[0], value[1]]);
  };

  // Commit to parent only on release (using functional update to avoid capturing filters)
  const commitSmoothness = useCallback((value: number[]) => {
    const next: [number, number] = [value[0], value[1]];
    onFiltersChange((prev) => ({
      ...prev,
      smoothnessRange: next,
    }));
  }, [onFiltersChange]);

  const handleAirlineToggle = (airline: string) => {
    const newAirlines = filters.airlines.includes(airline)
      ? filters.airlines.filter((a) => a !== airline)
      : [...filters.airlines, airline];
    onFiltersChange({ ...filters, airlines: newAirlines });
  };

  const handleStopToggle = (stop: string) => {
    const newStops = filters.stops.includes(stop)
      ? filters.stops.filter((s) => s !== stop)
      : [...filters.stops, stop];
    onFiltersChange({ ...filters, stops: newStops });
  };

  const selectAllAirlines = () => {
    onFiltersChange({ ...filters, airlines: [] });
  };

  const clearAllAirlines = () => {
    onFiltersChange({ ...filters, airlines: [...availableAirlines] });
  };


  const FilterSection = ({ 
    id, 
    title, 
    children 
  }: { 
    id: string; 
    title: string; 
    children: React.ReactNode 
  }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection(id)}
          className="flex w-full items-center justify-between py-2 text-left font-semibold text-foreground hover:text-foreground/80"
        >
          <span>{title}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {isExpanded && <div className="mt-3 space-y-3">{children}</div>}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Filters</h3>
        <button
          onClick={() =>
            onFiltersChange({
              smoothnessRange: [0, 100],
              airlines: [],
              stops: [],
              departureTime: [],
            })
          }
          className="text-sm text-primary hover:underline"
        >
          Clear all
        </button>
      </div>

      <Separator />

      {/* Flight Smoothness */}
      <FilterSection id="smoothness" title="Flight Smoothness">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-medium text-foreground">
            <span>Rough</span>
            <span>Smooth</span>
          </div>
          <div className="px-2">
            <Slider
              min={0}
              max={100}
              step={1}
              value={localRange}
              onValueChange={handleSmoothnessChange}
              onValueCommit={commitSmoothness}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{localRange[0]}</span>
            <span>{localRange[1]}</span>
          </div>
        </div>
      </FilterSection>

      {/* Airlines */}
      <FilterSection id="airlines" title="Airlines">
        <div className="mb-2 flex items-center gap-2 text-xs">
          <button
            onClick={selectAllAirlines}
            className="text-primary hover:underline"
          >
            Select all
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={clearAllAirlines}
            className="text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
        <div className="space-y-2">
          {availableAirlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No airlines available</p>
          ) : (
            availableAirlines.map((airline) => {
              const info = getAirlineInfo(airline);
              const isChecked = filters.airlines.length === 0 || filters.airlines.includes(airline);
              
              return (
                <div key={airline} className="flex items-center space-x-2">
                  <Checkbox
                    id={`airline-${airline}`}
                    checked={isChecked}
                    onCheckedChange={() => handleAirlineToggle(airline)}
                  />
                  <Label
                    htmlFor={`airline-${airline}`}
                    className="flex items-center gap-2 text-sm font-normal cursor-pointer flex-1"
                  >
                    <div className="flex h-6 w-8 items-center justify-center rounded bg-card border">
                      <img
                        src={info.logoUrl}
                        alt={`${airline} logo`}
                        className="h-5 w-7 object-contain"
                        onError={(e) => {
                          // Fallback to colored badge if logo fails to load
                          const target = e.currentTarget;
                          const parent = target.parentElement;
                          if (parent) {
                            parent.style.backgroundColor = info.bgColor;
                            parent.style.color = info.color;
                            parent.textContent = info.code;
                            parent.style.fontSize = '0.75rem';
                            parent.style.fontWeight = 'bold';
                          }
                        }}
                      />
                    </div>
                    <span>{airline}</span>
                  </Label>
                </div>
              );
            })
          )}
        </div>
      </FilterSection>

      {/* Stops */}
      <FilterSection id="stops" title="Stops">
        <div className="space-y-2">
          {["Nonstop", "1 stop", "2+ stops"].map((stop) => {
            const isChecked = filters.stops.length === 0 || filters.stops.includes(stop);
            return (
              <div key={stop} className="flex items-center space-x-2">
                <Checkbox
                  id={`stop-${stop}`}
                  checked={isChecked}
                  onCheckedChange={() => handleStopToggle(stop)}
                />
                <Label
                  htmlFor={`stop-${stop}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {stop}
                </Label>
              </div>
            );
          })}
        </div>
      </FilterSection>

      {/* Departure Time */}
      <FilterSection id="departure" title="Departure Time">
        <div className="space-y-2">
          {[
            { label: "Morning (6am - 12pm)", value: "morning" },
            { label: "Afternoon (12pm - 6pm)", value: "afternoon" },
            { label: "Evening (6pm - 12am)", value: "evening" },
            { label: "Night (12am - 6am)", value: "night" },
          ].map((time) => (
            <div key={time.value} className="flex items-center space-x-2">
              <Checkbox
                id={`time-${time.value}`}
                checked={
                  filters.departureTime.length === 0 ||
                  filters.departureTime.includes(time.value)
                }
                onCheckedChange={() => {
                  const newTimes = filters.departureTime.includes(time.value)
                    ? filters.departureTime.filter((t) => t !== time.value)
                    : [...filters.departureTime, time.value];
                  onFiltersChange({ ...filters, departureTime: newTimes });
                }}
              />
              <Label
                htmlFor={`time-${time.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {time.label}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>
    </div>
  );
});
